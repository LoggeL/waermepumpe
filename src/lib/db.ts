import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

function resolveDbPath(): string {
  if (process.env.DB_PATH) return process.env.DB_PATH
  // In Docker, /data will exist and be writable
  try {
    fs.accessSync('/data', fs.constants.W_OK)
    return '/data/waermepumpe.db'
  } catch {
    return path.join(process.cwd(), 'data', 'waermepumpe.db')
  }
}

const DB_PATH = resolveDbPath()

let _db: Database.Database | null = null

export function getDb(): Database.Database {
  if (_db) return _db

  const dir = path.dirname(DB_PATH)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  _db = new Database(DB_PATH)
  _db.pragma('journal_mode = WAL')
  _db.pragma('foreign_keys = ON')

  initSchema(_db)
  seedIfEmpty(_db)

  return _db
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS daily_readings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT UNIQUE NOT NULL,
      meter_hp REAL NOT NULL,
      meter_elec REAL NOT NULL,
      consumption_hp REAL,
      consumption_elec REAL,
      temp_min REAL,
      temp_max REAL,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS monthly_summary (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      year INTEGER NOT NULL,
      month INTEGER NOT NULL,
      kw_total REAL,
      avg_daily REAL,
      total_cost REAL,
      gas_comparison REAL,
      UNIQUE(year, month)
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `)
}

function seedIfEmpty(db: Database.Database) {
  const count = db.prepare('SELECT COUNT(*) as c FROM daily_readings').get() as { c: number }
  if (count.c > 0) return

  const seedPath = path.join(process.cwd(), 'SEED_DATA.json')
  if (!fs.existsSync(seedPath)) return

  const raw = fs.readFileSync(seedPath, 'utf-8')
  const seed = JSON.parse(raw)

  const insertReading = db.prepare(`
    INSERT OR IGNORE INTO daily_readings (date, meter_hp, meter_elec, consumption_hp, consumption_elec, temp_min, temp_max)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)

  const insertSummary = db.prepare(`
    INSERT OR IGNORE INTO monthly_summary (year, month, kw_total, avg_daily, total_cost, gas_comparison)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  const insertSetting = db.prepare(`
    INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)
  `)

  const tx = db.transaction(() => {
    let prevHp: number | null = null
    let prevElec: number | null = null

    for (const r of seed.daily_readings) {
      const [tempMax, tempMin] = r.weather ? r.weather.split(';').map(Number) : [null, null]
      const consHp = prevHp !== null ? r.meter_hp - prevHp : null
      const consElec = prevElec !== null ? r.meter_elec - prevElec : null

      insertReading.run(r.date, r.meter_hp, r.meter_elec, consHp, consElec, tempMin, tempMax)
      prevHp = r.meter_hp
      prevElec = r.meter_elec
    }

    const gasMonthly = seed.gas_comparison?.gas_24_25 || []
    for (const m of seed.monthly_summary) {
      const monthIndex = m.month - 1
      const gasCost = gasMonthly[monthIndex] ?? m.mon_cost
      insertSummary.run(m.year, m.month, m.kw_mo, m.kw_tag, m.euro_mo, gasCost)
    }

    insertSetting.run('price_per_kwh', String(seed.gas_comparison?.price_per_kwh || 0.3288))
    insertSetting.run('latitude', '49.5394')
    insertSetting.run('longitude', '8.1936')
    insertSetting.run('location_name', 'Kindenheim')
  })

  tx()
}
