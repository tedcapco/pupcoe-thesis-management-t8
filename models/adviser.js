const db = require('../db/db.js')

var actions = {
  classList: (filter,callback) => {
      const query =
      `SELECT users.id as student_id, users.first_name,users.last_name,class.id as class_id
      FROM class_members 
    inner join users on users.id = class_members.user_id
    inner join class ON class.id = class_members.class_id
      WHERE class.adviser_id = '${filter.id}' and class.id = '${filter.class}'
      AND   class_members.user_id NOT IN 
      (select user_id from group_members) `;
       db.query(query)
      .then(res => callback(res.rows))
      .catch(e => {
        console.log(e)
        callback(e)
      })
    },
  classId: (filter,callback) => {
      const query =
      `select id,batch_year,section from class where adviser_id = ${filter.id} `;
       db.query(query)
      .then(res => callback(res))
      .catch(e => {
        console.log(e)
        callback(e)
      })
    },
  groupList: (filter,callback) => {
      const query =
      `select * from groups where class_id = ${filter.id} `;
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
    createGroup: (groupData,callback) => {
    const query =
    `INSERT INTO 
      groups (group_name,class_id) 
     VALUES 
      ('${groupData.groupName}','${groupData.classid}') 
      RETURNING id
      `;
     db.query(query)
    .then(res => callback(res.rows))
    .catch(e => {
      console.log(e)
      callback(e)
    })
  },
    insertMembers: (groupData,callback) => {
    const query =
    `INSERT INTO 
      group_members (group_id,user_id) 
     VALUES 
      ${groupData}
      `;
     db.query(query)
    .then(res => callback(res))
    .catch(e => {
      console.log(e)
      callback(e)
    })
  },
    insertCommentProposal: (groupData,callback) => {
    const query =
    `INSERT INTO 
      proposal_comments (thesis_id, author_id, content) 
     VALUES 
      ('${groupData.thesis_id}', '${groupData.author_id}', '${groupData.comment}')
      `;
     db.query(query)
    .then(res => callback(res))
    .catch(e => {
      console.log(e)
      callback(e)
    })
  },
    listThesisProposals: (filter,callback) => {
    const query =
    `select thesis.id,thesis_title,group_id,thesis.upload,current_stage,abstract,current_stage,groups.class_id, class.adviser_id from thesis
      inner join groups on groups.id = group_id
      inner join class on class.id = groups.class_id
      where adviser_id = ${filter.adviserid} and current_stage = ${filter.currentstage}
      `;
     db.query(query)
    .then(res => callback(res))
    .catch(e => {
      console.log(e)
      callback(e)
    })
  },
    listThesis: (filter,callback) => {
    const query =
    `select thesis.id,thesis_title,group_id,thesis.upload,current_stage,abstract,current_stage,groups.class_id, class.adviser_id from thesis
      inner join groups on groups.id = group_id
      inner join class on class.id = groups.class_id
    where current_stage = ${filter.currentstage} 
    and thesis.id not in (select thesis_id from approval_table where created_by = ${filter.userid})
      `;
     db.query(query)
    .then(res => callback(res))
    .catch(e => {
      console.log(e)
      callback(e)
    })
  },
    gradeProposal: (filter,callback) => {
    const query =
    ` update thesis
      set current_stage = ${filter.current_stage}
      where id = ${filter.thesis_id}
      `;
     db.query(query)
    .then(res => callback(res))
    .catch(e => {
      console.log(e)
      callback(e)
    })
  },
    committeeVote: (data,callback) => {
    const query =
    ` insert into approval_table (thesis_id,created_by,vote)
      values (${data.thesisid},${data.committeeid},${data.vote})
      `;
     db.query(query)
    .then(res => callback(res))
    .catch(e => {
      console.log(e)
      callback(e)
    })
  },
    countVote: (filter,callback) => {
    const query =
    ` select count (thesis_id) from approval_table
      where vote = 9 and thesis_id = ${filter.thesisid}    `;
     db.query(query)
    .then(res => callback(res.rows))
    .catch(e => {
      console.log(e)
      callback(e)
    })
  },
    thesisUpdateStatus: (filter,callback) => {
    const query =
    `update thesis
     set current_stage = ${filter.currentstage}
     where id = ${filter.thesisid}    `;
     db.query(query)
    .then(res => callback(res))
    .catch(e => {
      console.log(e)
      callback(e)
    })
  },
    reviewedProposalsAdviser: (filter,callback) => {
    const query =
    `select thesis.id,thesis_title,group_id,thesis_status.status,abstract,groups.class_id, class.adviser_id from thesis
      inner join groups on groups.id = group_id
      inner join class on class.id = groups.class_id
      inner join thesis_status on thesis_status.id = current_stage
      where adviser_id = ${filter.adviserid} and current_stage != 1 `;
     db.query(query)
    .then(res => callback(res))
    .catch(e => {
      console.log(e)
      callback(e)
    })
  },
    reviewedProposalsCommittee: (filter,callback) => {
    const query =
    `select distinct thesis_id,thesis_status.status,thesis.thesis_title from approval_table
      inner join thesis on thesis.id = thesis_id
      inner join thesis_status on thesis_status.id = vote 
      where approval_table.created_by = ${filter.userid}`;
     db.query(query)
    .then(res => callback(res))
    .catch(e => {
      console.log(e)
      callback(e)
    })
  },
    thesisDefense: (filter,callback) => {
    const query =
    `select  defense.id,thesis_id,defense_type,thesis.thesis_title,thesis.abstract
    from defense inner join thesis on thesis.id = thesis_id
     where defense_type = 'MOR'`;
     db.query(query)
    .then(res => callback(res))
    .catch(e => {
      console.log(e)
      callback(e)
    })
  },
    updateThesisGrade: (filter,callback) => {
    const query =
    `update grades set grades_id= ${filter.grades} where id = ${filter.id}`;
     db.query(query)
    .then(res => callback(res))
    .catch(e => {
      console.log(e)
      callback(e)
    })
  },
    insertPanelMember: (filter,callback) => {
    const query =
    `insert into panel_members (panel_id,faculty_id) values (${filter.panelid},${filter.facultyid}) `;
     db.query(query)
    .then(res => callback(res))
    .catch(e => {
      console.log(e)
      callback(e)
    })
  },
    insertHeadPanelMember: (filter,callback) => {
    const query =
    `insert into panel_members (panel_id,head_panel_id) values (${filter.panelid},${filter.facultyid}) `;
     db.query(query)
    .then(res => callback(res))
    .catch(e => {
      console.log(e)
      callback(e)
    })
  },
    defenseGrade: (filter,callback) => {
    const query =
    `update defense set grades_id = ${filter.grade} where id = ${filter.defense_id}`;
     db.query(query)
    .then(res => callback(res))
    .catch(e => {
      console.log(e)
      callback(e)
    })
  }

}
module.exports = actions