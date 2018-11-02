const db = require('../db/db.js')

var actions = {
  createUser: (userData,callback) => {
      const query =
      `INSERT INTO 
        users (first_name,middle_name,last_name,email,password,user_type,contact_no) 
       VALUES 
        ('${userData.firstName}','${userData.middleName}','${userData.lastName}','${userData.email}','${userData.password}','${userData.userType}','${userData.contactNo}') 
        RETURNING id`;
       db.query(query)
      .then(res => callback(res.rows))
      .catch(e => {
        console.log(e)
        callback(e)
      })
    }, 
     createClass: (classData,callback) => {
      const query =
      `INSERT INTO 
        class (section,adviser_id,batch_year) 
       VALUES 
        ('${classData.section}','${classData.adviserid}','${classData.acadyear}') 
       `;
       db.query(query)
      .then(res => callback(res.rows))
      .catch(e => {
        console.log(e)
        callback(e)
      })
    },
    insertStudent: (userData,callback) => {
    const query =
    `INSERT INTO 
      class_members (class_id,user_id) 
     VALUES 
      ('${userData.classid}','${userData.userid}') 
      `;
     db.query(query)
    .then(res => callback(res))
    .catch(e => {
      console.log(e)
      callback(e)
    })
    },
    getByEmail: (email,callback) => {
    const query =
    ` select * from users where email = '${email}'
     `;
     db.query(query)
    .then(res => callback(res.rows[0]))
    .catch(e => callback(e))
   },
    getById: (id,callback) => {
    const query =
    ` select * from users where id = '${id}'
     `;
     db.query(query)
    .then(res => callback(res.rows[0]))
      .catch(e => callback(e))
    },
    getGroupId: (id,callback) => {
    const query =
    ` select group_id from 
      group_members where user_id = ${id} `;
     db.query(query)
    .then(res => callback(res.rows[0]))
      .catch(e => callback(e))
    },
    sectionList: (filter,callback) => {
    const query =
    `SELECT
      id, section, batch_year
     FROM
      class 
      ORDER BY batch_YEAR ASC, section ASC
      `;
     db.query(query)
    .then(res => callback(res.rows))
    .catch(e => {
      console.log(e)
      callback(e)
    })

    },
    facultyList: (filter,callback) => {
    const query =
    `SELECT
      *
     FROM
       users
     WHERE
       user_type = 'faculty' 
      `;
     db.query(query)
    .then(res => callback(res.rows))
    .catch(e => {
      console.log(e)
      callback(e)
    })

    },
    checkIfCommittee: (filter,callback) => {
    const query =
    `SELECT
       1
     FROM
       committee_members
     WHERE
       faculty_id = ${filter} 
      `;
     db.query(query)
    .then(res => callback(res))
    .catch(e => {
      console.log(e)
      callback(e)
    })

    },
    checkIfAdviser: (filter,callback) => {
    const query =
    `SELECT
       1
     FROM
       class
     WHERE
       adviser_id = ${filter} 
      `;
     db.query(query)
    .then(res => callback(res))
    .catch(e => {
      console.log(e)
      callback(e)
    })

    },
    studentList: (studentsb,callback) => {
    const query =
    `SELECT class_members.class_id, class_members.user_id,
      users.id AS student_id, users.first_name, users.middle_name, users.last_name, users.contact_no, users.email,
      class.adviser_id, class.section, class.batch_year
        FROM class_members
        INNER JOIN class ON class.id = class_id
        INNER JOIN users ON users.id = class_members.user_id
        WHERE batch_year = '${studentsb}'
        ORDER BY section ASC
      `;
     db.query(query)
    .then(res => callback(res.rows))
    .catch(e => {
      console.log(e)
      callback(e)
    })

    },
    advicerList: (filter,callback) => {
    const query =
    `SELECT class.section AS section, users.prefix AS prefix, users.first_name AS first_name, users.last_name AS last_name
      FROM class
      INNER JOIN users ON users.id = adviser_id
      `;
     db.query(query)
    .then(res => callback(res.rows))
    .catch(e => {
      console.log(e)
      callback(e)
    })
    },
    facultyUpdate: (filter,callback) => {
    const query =
    `UPDATE
        users
      SET
        prefix = '${filter.prefix}',
        first_name = '${filter.first_name}',
        middle_name = '${filter.middle_name}',
        last_name = '${filter.last_name}',
        contact_no = '${filter.contact_no}',
        email = '${filter.email}'
      WHERE
        id = '${filter.user_id}' 
      `;
     db.query(query)
    .then(res => callback(res.rows))
    .catch(e => {
      console.log(e)
      callback(e)
    })
    },
    studentUpdate: (filter,callback) => {
    const query =
    `UPDATE
        users
      SET
        first_name = '${filter.first_name}',
        middle_name = '${filter.middle_name}',
        last_name = '${filter.last_name}',
        contact_no = '${filter.contact_no}',
        email = '${filter.email}'
      WHERE
        id = '${filter.user_id}' 
      `;
     db.query(query)
    .then(res => callback(res.rows))
    .catch(e => {
      console.log(e)
      callback(e)
    })
    },
    studentClassUpdate: (filter,callback) => {
    const query =
    `UPDATE
        class_members
      SET
        class_id = '${filter.class_id}'
      WHERE
        user_id = '${filter.user_id}' 
      `;
     db.query(query)
    .then(res => callback(res.rows))
    .catch(e => {
      console.log(e)
      callback(e)
    })
    },
    classList: (filter,callback) => {
    const query =
    `SELECT *
      FROM class
      ORDER BY batch_year ASC, BY section ASC 
      `;
     db.query(query)
    .then(res => callback(res.rows))
    .catch(e => {
      console.log(e)
      callback(e)
    })
    },
    facultyListNotCommittee: (filter,callback) => {
    const query =
    `SELECT users.id, users.prefix, users.first_name, users.middle_name, users.last_name
      FROM users 
      WHERE users.id NOT IN (SELECT committee_members.faculty_id FROM committee_members) AND user_type = 'faculty'
      `;
     db.query(query)
    .then(res => callback(res))
    .catch(e => {
      console.log(e)
      callback(e)
    })

    },
    facultyListCommittee: (filter,callback) => {
    const query =
    `SELECT users.id, users.prefix, users.first_name, users.middle_name, users.last_name
      FROM committee_members
      INNER JOIN users ON users.id = faculty_id
      `;
     db.query(query)
    .then(res => callback(res))
    .catch(e => {
      console.log(e)
      callback(e)
    })

    },
    addCommittee: (filter,callback) => {
    const query =
    `INSERT INTO
      committee_members
      (faculty_id, created_by)
      VALUES
      ('${filter.faculty_id}', '${filter.user_id}')
      `;
     db.query(query)
    .then(res => callback(res))
    .catch(e => {
      console.log(e)
      callback(e)
    })

    },
    removeCommittee: (filter,callback) => {
    const query =
    `DELETE FROM
      committee_members
      WHERE
        faculty_id = '${filter.committee_id}'
      `;
     db.query(query)
    .then(res => callback(res))
    .catch(e => {
      console.log(e)
      callback(e)
    })

    },
    totalAccounts: (filter,callback) => {
    const query =
    `SELECT COUNT(*) AS count FROM users;
      `;
     db.query(query)
    .then(res => callback(res))
    .catch(e => {
      console.log(e)
      callback(e)
    })

    }

  }
module.exports = actions