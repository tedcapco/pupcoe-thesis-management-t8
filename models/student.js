const db = require('../db/db.js')

var actions = {
    studentGroupmates: (group_id,callback) => {
    const query =
    `SELECT group_members.group_id, groups.group_name, users.first_name, users.middle_name, users.last_name, users.contact_no, users.email,users.image
      FROM group_members
      INNER JOIN groups ON groups.id = group_id
      INNER JOIN users ON users.id = group_members.user_id
      WHERE group_members.group_id = '${group_id.group_id}'
      `;
     db.query(query)
    .then(res => callback(res))
    .catch(e => {
      console.log(e)
      callback(e)
    })
  },
    studentAdviser: (filter,callback) => {
    const query =
    `SELECT class.id, class.section, class.adviser_id, class.batch_year, class.section,
            users.first_name, users.middle_name, users.last_name
        FROM class_members
        INNER JOIN class ON class.id = class_id
        INNER JOIN users ON users.id = class.adviser_id
        WHERE class_members.user_id = '${filter.student_id}'
      `;
     db.query(query)
    .then(res => callback(res))
    .catch(e => {
      console.log(e)
      callback(e)
    })
  },
    addProposal: (thesisData,callback) => {
    const query =
    `INSERT INTO 
      thesis (thesis_title,group_id,current_stage,abstract,upload) 
     VALUES 
      ('${thesisData.title}',${thesisData.groupid},'1','${thesisData.abstract}','${thesisData.filename}')
      `;
     db.query(query)
    .then(res => callback(res))
    .catch(e => {
      console.log(e)
      callback(e)
    })
  },
    proposalList: (filter,callback) => {
    const query =
    `select *,thesis_status.status from thesis 
     inner join thesis_status on thesis_status.id = current_stage
    where group_id = ${filter.groupid} and (current_stage = 1 or current_stage = 2 or current_stage = 4)`;
     db.query(query)
    .then(res => callback(res))
    .catch(e => {
      console.log(e)
      callback(e)
    })
  },
    approvalList: (filter,callback) => {
    const query =
    `select  thesis.id,thesis.thesis_title,thesis.abstract,thesis.current_stage,thesis.group_id,vote,thesis_status.status,count(*) from approval_table
    inner join thesis on thesis.id = thesis_id
    inner join thesis_status on thesis_status.id = thesis.current_stage
      where thesis.group_id = ${filter.groupid}   and thesis.current_stage = 2 or thesis.current_stage = 5 group by ( thesis.id,thesis.thesis_title,thesis.abstract,thesis.group_id,vote,thesis_status.status)`;
     db.query(query)
    .then(res => callback(res))
    .catch(e => {
      console.log(e)
      callback(e)
    })
  },
    updateThesisStatus: (filter,callback) => {
    const query =
    `update thesis 
    set current_stage = ${filter.stage} 
    where id = ${filter.thesisid}`;
     db.query(query)
    .then(res => callback(res))
    .catch(e => {
      console.log(e)
      callback(e)
    })
  },   
   insertToDefense: (filter,callback) => {
    const query =
    `insert into defense (defense_type,thesis_id)
     values ('${filter.type}','${filter.thesisid}')`;
     db.query(query)
    .then(res => callback(res))
    .catch(e => {
      console.log(e)
      callback(e)
    })
  },  
   uploadImage: (filter,callback) => {
    const query =
    `update users set image = '${filter.image}' where id = '${filter.id}'`;
     db.query(query)
    .then(res => callback(res))
    .catch(e => {
      console.log(e)
      callback(e)
    })
  }
}
module.exports = actions