import mysql from 'mysql2'

const db = mysql.createConnection({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT
})

db.connect((error) => {
  if (error) {
    console.error('Railway MySQL connection failed:', error.message)
    return
  }

  console.log('Connected to Railway MySQL')

  const createUsersTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100),
      email VARCHAR(100) UNIQUE,
      password VARCHAR(255),
      reset_token VARCHAR(255),
      reset_token_expiry DATETIME,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `

  db.query(createUsersTableQuery, (tableError) => {
    if (tableError) {
      console.error('Error creating users table:', tableError.message)
      return
    }

    const createFilesTableQuery = `
      CREATE TABLE IF NOT EXISTS files (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        stored_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_type VARCHAR(100),
        file_size BIGINT,
        is_deleted BOOLEAN DEFAULT FALSE,
        is_shared BOOLEAN DEFAULT FALSE,
        share_token VARCHAR(255) DEFAULT NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL DEFAULT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `

    db.query(createFilesTableQuery, (filesTableError) => {
      if (filesTableError) {
        console.error('Error creating files table:', filesTableError.message)
        return
      }

      console.log('Files table created successfully (or already exists)')

      const addShareExpiryColumnQuery =
        'ALTER TABLE files ADD COLUMN share_expiry DATETIME NULL'

      db.query(addShareExpiryColumnQuery, (shareExpiryColumnError) => {
        if (shareExpiryColumnError) {
          if (shareExpiryColumnError.code === 'ER_DUP_FIELDNAME') {
            console.log('share_expiry column already exists in files table')
            return
          }

          console.error('Error ensuring share_expiry column:', shareExpiryColumnError.message)
          return
        }

        console.log('share_expiry column added to files table')
      })
    })

    const findResetTokenColumnQuery = `
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ?
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME = 'reset_token'
    `

    db.query(findResetTokenColumnQuery, [process.env.MYSQLDATABASE], (resetTokenLookupError, resetTokenColumns) => {
      if (resetTokenLookupError) {
        console.error('Error checking reset_token column:', resetTokenLookupError.message)
        return
      }

      const ensureResetTokenExpiryColumn = () => {
        const findResetTokenExpiryColumnQuery = `
          SELECT COLUMN_NAME
          FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_SCHEMA = ?
          AND TABLE_NAME = 'users'
          AND COLUMN_NAME = 'reset_token_expiry'
        `

        db.query(
          findResetTokenExpiryColumnQuery,
          [process.env.MYSQLDATABASE],
          (resetTokenExpiryLookupError, resetTokenExpiryColumns) => {
            if (resetTokenExpiryLookupError) {
              console.error(
                'Error checking reset_token_expiry column:',
                resetTokenExpiryLookupError.message
              )
              return
            }

            if (resetTokenExpiryColumns.length > 0) {
              console.log('Users table created and reset password columns are ready')
              return
            }

            const addResetTokenExpiryColumnQuery =
              'ALTER TABLE users ADD COLUMN reset_token_expiry DATETIME'

            db.query(addResetTokenExpiryColumnQuery, (resetTokenExpiryColumnError) => {
              if (resetTokenExpiryColumnError) {
                console.error(
                  'Error adding reset_token_expiry column:',
                  resetTokenExpiryColumnError.message
                )
                return
              }

              console.log('Users table created and reset password columns are ready')
            })
          }
        )
      }

      if (resetTokenColumns.length > 0) {
        ensureResetTokenExpiryColumn()
        return
      }

      const addResetTokenColumnQuery =
        'ALTER TABLE users ADD COLUMN reset_token VARCHAR(255)'

      db.query(addResetTokenColumnQuery, (resetTokenColumnError) => {
        if (resetTokenColumnError) {
          console.error('Error adding reset_token column:', resetTokenColumnError.message)
          return
        }

        ensureResetTokenExpiryColumn()
      })
    })
  })
})

export default db
