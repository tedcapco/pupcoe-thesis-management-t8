const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const session = require('express-session');
const bodyParser = require('body-parser')
const flash = require('express-flash-messages');
const expressValidator = require('express-validator');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
const upload = multer({storage: storage})
const db = require('./db/db.js')
const admin = require('./models/admin.js')
const adviser = require('./models/adviser.js')
const student = require('./models/student.js')

const passport = require('passport');
const Strategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

const app = express();
// tell express which folder is a static/public folder
app.set('views', path.join(__dirname,'views'));
app.engine('handlebars', exphbs({
  defaultLayout:'main',
  layoutsDir: __dirname + '/views/layouts/',
  partialsDir: __dirname + '/views/partials/'
}));
app.set('view engine','handlebars');
app.set('port',(process.env.PORT|| 3000));
app.use(express.static(path.join(__dirname, 'public')));

//body-parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
app.use(express.json());

//session
app.use(session({
  secret: 'cpethesismanagement',
  resave: false,
  saveUninitialized: true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(expressValidator());

passport.use(new Strategy({
  usernameField: 'email',
  passwordField: 'password'
},
  function(email, password, cb) {
    admin.getByEmail(email, function(user) {
      if (!user) { return cb(null, false); }
      bcrypt.compare(password, user.password).then(function(res) {
      if (res == false) { return cb(null, false); }
      return cb(null, user);
      });

   });
}));

passport.serializeUser(function(user, cb){
  cb(null, user.id);


});

passport.deserializeUser(function(id, cb) {
  admin.getById(id, function (user) {
    cb(null, user);
  });
});
function isAdmin(req, res, next) {
   if (req.isAuthenticated()) {
      console.log(req.user);
    role = req.user.isAdmin
    console.log(role)
    if (req.user.isAdmin == true) {
      req.session.admin == true;
        return next();
    }
    else{
      res.render('error401');
    }
  }
  else{
res.redirect('/');
  }
}
function isFaculty(req, res, next) {
   if (req.isAuthenticated()) {
  admin.checkIfCommittee(req.user.id,function(result){
    if(result.rowCount > 0){
      req.session.committee = true;
    }
  });
  admin.checkIfAdviser(req.user.id,function(result){
    if(result.rowCount > 0){
      req.session.adviser = true;
    }
  });
  admin.getById(req.user.id,function(user){
    req.session.admin = req.user.isAdmin;
    role = req.user.user_type  
    console.log('role:',role);
    if (role == 'faculty') { 
    console.log(req.session.admin)   
        return next();
    }
    else{
     res.render('error401');
    }

  });

  }
  else{
res.redirect('/');
}
}

function isAdviser(req,res,next){
  if (req.session.adviser != true){
    res.render('error401')
  }
  else{
    return next();
  }
}


function isStudent(req, res, next) {
   if (req.isAuthenticated()) {
  admin.getGroupId(req.user.id,function(user){
    req.session.group_id = user.group_id;
    console.log(req.session.group_id)
    role = req.user.user_type;
    if (role == 'student') {
        return next();
    }
    else{
      res.render('error401');
    }
  });
  }
  else{
res.redirect('/');
}
}
function isGuest(req, res, next) {
   if (req.isAuthenticated()) {
 
    role = req.user.user_type;
    console.log('role:',role);
    if (role == 'guest') {
        return next();
    }
    else{
      res.render('error401');
    }
  }
  else{
res.redirect('/');
}
}

//--------------------------------------------------
app.get('/logout', function(req, res){
  req.session.destroy();
  req.logout();
  res.redirect('/');
});

app.get('/uploads', (req, res) => {
  res.render('sample', {
  });
});
app.post('/uploads', upload.single('file-to-upload'), (req, res) => {
  console.log('The filename is ' + res.req.file.filename);
  res.redirect('/');
});

app.get('/', function (req, res) {
  res.render('cpe_admin/admin_login', {
  });
});

app.get('/home', function(req, res) {
	res.render('home',{
	});
});

app.get('/forgot_password', function(req, res) {
	res.render('forgot_password',{
		
	});
});

app.get('/compendium', function(req, res) {
	res.render('compendium',{
		
	});
});

app.get('/signup', function(req, res) {
  res.render('signup',{
    
  });
});
//

//ADMIN
app.get('/login', function(req, res) {
	res.render('cpe_admin/admin_login',{
		
	});
});

app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
  admin.getById(req.user.id,function(user){
    role = user.user_type;
    req.session.user = user;
      console.log(req.session.user);
    console.log('role:',role);
    if (role == 'student'){
        res.redirect('/students/home')
    }
    else if (role == 'faculty'){
        res.redirect('/faculty/dashboard')
    }
    else if (role == 'guest'){
        res.redirect('/guest_panel/home')
    }
 		 });
  });

app.get('/admin/dashboard',isAdmin, function(req, res) {
  admin.totalAccounts({}, function(totalAccounts) {
    res.render('cpe_admin/admin_dashboard',{
          first_name: req.user.first_name,
          middle_name: req.user.middle_name,
          last_name: req.user.last_name,
          count: totalAccounts.rows[0].count,
          admin:req.session.admin
    });
  });
});

app.get('/admin/registration', isAdmin, function(req, res) {
  admin.sectionList({},function(classList){
  	admin.facultyList({},function(facultyList){
  			res.render('cpe_admin/admin_registration',{
          // first_name: req.user.first_name,
          // middle_name: req.user.middle_name,
          // last_name: req.user.last_name,
  				class: classList,
          faculty: facultyList,
          admin:req.session.admin
    	    });
    	 });
    });
});

app.post('/admin/registration/user', isAdmin, function (req, res) {
		bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(req.body.password, salt, function(err, hash) {
         admin.createUser(
		  {
		    firstName: req.body.fname,
		    middleName: req.body.mname,
		    lastName: req.body.lname, 
		    contactNo: req.body.contacts,
		    email: req.body.email,
		    userType: req.body.usertype,
		    password: hash
		  },
		  function(id){
		  	console.log(id[0].id)
		 	if (req.body.usertype == "student"){
         admin.insertStudent(
		  {
		    userid: id[0].id,
		    classid: req.body.class
		  },
		  function(callback){;
		 	  });
	}
		    res.redirect('/admin/registration');
		 	  });
	   });
	});
});

app.post('/admin/registration/class', isAdmin,function (req, res) {

  admin.createClass(
      {
        section: req.body.class_no,
        adviserid: req.body.adviser,
        acadyear: req.body.acad_year,
      },
      function(callback){
        res.redirect('/admin/registration');
      });
  });

app.get('/admin/students', function(req, res) {
  var batchList;
  var batch2014;
  var batch2015;
  var batch2016;
  var batch2017;
  var batch2018;

  admin.studentList(2014, function(studentsb) {
    batch2014 = studentsb
  admin.studentList(2015, function(studentsb) {
    batch2015 = studentsb
  admin.studentList(2016, function(studentsb) {
    batch2016 = studentsb
  admin.studentList(2017, function(studentsb) {
    batch2017 = studentsb
  admin.studentList(2018, function(studentsb) {
    batch2018 = studentsb
            admin.sectionList({}, function(classList) {
              batchList = classList
              res.render('cpe_admin/admin_students',{
                first_name: req.user.first_name,
                middle_name: req.user.middle_name,
                last_name: req.user.last_name,
                batch2014: batch2014,
                batch2015: batch2015,
                batch2016: batch2016,
                batch2017: batch2017,
                batch2018: batch2018,
                classes: batchList
              });
            });
          });
        });
      });
    });
  });
});

app.post('/admin/students/update', function(req, res) {
  admin.studentUpdate(
    {
      user_id: req.body.user_id,
      first_name: req.body.first_name,
      middle_name: req.body.middle_name,
      last_name: req.body.last_name,
      contact_no: req.body.contact_no,
      email: req.body.email,
    },
    function(callback){
      admin.studentClassUpdate(
        {
          user_id: req.body.user_id,
          class_id: req.body.class_id
        },
    function(call){
      res.redirect('/admin/students');
    });
  });
});

app.get('/admin/faculty', function(req, res) {
  admin.advicerList({},function(advicerList){
    admin.facultyList({},function(facultyList){
      admin.facultyListNotCommittee({}, function(facultyListNotCommittee){
        admin.facultyListCommittee({}, function(facultyListCommittee){
            res.render('cpe_admin/admin_faculty',{
          first_name: req.user.first_name,
          middle_name: req.user.middle_name,
          last_name: req.user.last_name,
              advicers: advicerList,
              faculties: facultyList,
              notCommittee: facultyListNotCommittee.rows,
              committee: facultyListCommittee.rows
            });
          });
        });
     });
  });
});

app.post('/admin/committee/remove', function(req, res) {
  admin.removeCommittee(
    {
      user_id: req.user.id,
      committee_id: req.body.committee_id
    },
    function(callback){
      res.redirect('/admin/faculty');
    });
});

app.post('/admin/committee/add', function(req, res) {
  admin.addCommittee(
    {
      user_id: req.user.id,
      faculty_id: req.body.faculty_id
    },
    function(callback){
      res.redirect('/admin/faculty');
    });
});

app.post('/admin/faculty/update', function(req, res) {
  admin.facultyUpdate(
    {
      user_id: req.body.user_id,
      prefix: req.body.prefix,
      first_name: req.body.first_name,
      middle_name: req.body.middle_name,
      last_name: req.body.last_name,
      contact_no: req.body.contact_no,
      email: req.body.email,
    },
    function(callback){
      res.redirect('/admin/faculty');
    });
});

app.get('/admin/guest_panel', isAdmin,function(req, res) {
	res.render('cpe_admin/admin_guest_panel',{
          first_name: req.user.first_name,
          middle_name: req.user.middle_name,
          last_name: req.user.last_name
	});
});

app.get('/admin/class_management',isAdmin, function(req, res) {
	res.render('cpe_admin/admin_class_management',{
          first_name: req.user.first_name,
          middle_name: req.user.middle_name,
          last_name: req.user.last_name		
	});
});

app.get('/admin/schedule', isFaculty, function(req, res) {
  res.render('cpe_admin/admin_schedule',{
      first_name: req.user.first_name,
      middle_name: req.user.middle_name,
      last_name: req.user.last_name,
      admin:req.session.admin
  });
});

app.get('/admin/settings', isAdmin,function(req, res) {
	res.render('cpe_admin/admin_account_settings',{
      first_name: req.user.first_name,
      middle_name: req.user.middle_name,
      last_name: req.user.last_name
	});
});
//ADMIN---------------------------------------------

//FACULTY---------------------------------------------
app.get('/faculty/dashboard', isFaculty,function(req, res) {
  res.render('cpe_faculty/faculty_dashboard',{
    first_name: req.user.first_name,
    middle_name: req.user.middle_name,
    last_name: req.user.last_name,
    adviser: req.session.adviser,
    committee: req.session.committee,
    admin:req.session.admin
  });
});

app.get('/faculty/proposals',isFaculty,function(req, res) {
  var thesis_list;
  adviser.listThesis({currentstage: 2,userid: req.user.id},function(result){
    thesis_list =  result.rows
  });
  adviser.reviewedProposalsCommittee({userid:req.user.id},function(result){
       console.log(result)
        res.render('cpe_faculty/faculty_proposals',{
          first_name: req.user.first_name,
          middle_name: req.user.middle_name,
          last_name: req.user.last_name,
          thesisList: thesis_list,
          adviser: req.session.adviser,
          committee: req.session.committee,
          reviewedCommittee: result.rows,
          admin:req.session.admin
    });
  }); 
});

app.post('/adviser/proposals/grade',  isFaculty,function (req, res) {
    adviser.gradeProposal(
      {
        current_stage: req.body.currentstage,
        thesis_id: req.body.thesis_id,
      },
      function(callback){  
        adviser.insertCommentProposal(
        {
          author_id: req.user.id,
          thesis_id: req.body.thesis_id,
          comment: req.body.comment
        },
        function(callback){
       res.redirect('/faculty/mor');
     });  
   });
});

app.get('/faculty/mor',  isFaculty,function(req, res) {
  var group_list;
  var proposal_list;
  var reviewedAd;
   adviser.reviewedProposalsAdviser({adviserid:req.user.id},function(result){
      reviewedAd = result.rows

  });
  adviser.listThesisProposals({currentstage: 1,adviserid: req.user.id},function(result){
    proposal_list =  result.rows
  });
  adviser.classId({id:req.user.id},function(result){ 
    if (result.rowCount>0){
    if (req.session.classid == undefined){
        req.session.classid = result.rows[0].id;
        adviser.classList({id:req.user.id,class:req.session.classid},function(classList){
           adviser.groupList({id:req.session.classid},function(groupList){
             res.render('cpe_faculty/faculty_mor',{
            first_name: req.user.first_name,
            middle_name: req.user.middle_name,
            last_name: req.user.last_name,
             classHandled:result.rows,
             classList:classList,
             proposal: proposal_list,
             classid:req.session.classid,
             groupList: groupList,
             reviewedAdviser: reviewedAd,
             adviser: req.session.adviser,
             committee:req.session.committee,
             admin:req.session.admin
          });
        });
      });
      }
   else{ 
       adviser.classList({id:req.user.id,class:req.session.classid},function(classList){
        adviser.groupList({id:req.session.classid},function(groupList){
          res.render('cpe_faculty/faculty_mor',{
          first_name: req.user.first_name,
          middle_name: req.user.middle_name,
          last_name: req.user.last_name,
          classHandled:result.rows,
          classList:classList,
          classid:req.session.classid,  
          groupList: groupList,
          proposal: proposal_list,
          reviewedAdviser: reviewedAd,
          adviser: req.session.adviser,
          committee:req.session.committee,
          admin:req.session.admin 
            });
          });
      });
    }
  }
});
});

app.post('/downloadFile', function (req, res) {
   var file = 'public/uploads/'+ req.body.filename
   res.download(file, function (err) {
       if (err) {
           console.log("Error");
           console.log(err);
       } else {
           console.log("Success");
       }
   });
});

app.post('/faculty/mor/classid',  isFaculty,function (req, res) {
  req.session.classid = req.body.class_id
  res.redirect('/faculty/mor')
});

app.post('/faculty/mor', function (req, res) {
  var studentid = req.body.studentid;
  var groupData  = "";
  adviser.createGroup({
      groupName: req.body.groupName,
      classid: req.body.classid
    },
      function(id){  
        for (var i = 0; i < studentid.length;i++){
        groupData = groupData + "('"+id[0].id+"','"+studentid[i]+"')"+",";
    }
      groupData = groupData.slice(0,-1);
      console.log(groupData);
      adviser.insertMembers(groupData ,
      function(callback){
    });
      res.redirect('/faculty/mor');
  });
});

app.post('/adviser/mor/vote', isFaculty, function (req, res) {
      adviser.insertCommentProposal(
      {
        author_id: req.user.id,
        thesis_id: req.body.thesis_id,
        comment: req.body.comment
      },
      function(call){
      adviser.committeeVote({
        thesisid: req.body.thesis_id,
        committeeid: req.user.id,
        vote: req.body.grade
      },
      function(callback){
        adviser.countVote({thesisid:req.body.thesis_id},function(count){
          console.log(count[0].count)
          if (count[0].count >= 7){
            adviser.thesisUpdateStatus({
            thesisid: req.body.thesis_id,
            currentstage: 5
          },
          function(callback){  
            console.log(callback)
            res.redirect('/faculty/proposals');
            });
           }
          else{
              res.redirect('/faculty/proposals');
            }
        });
        });
    });
});

app.get('/faculty/title_defense', isFaculty,function(req, res) {
    adviser.thesisDefense({},function(result){
    res.render('cpe_faculty/faculty_title_defense',{
      first_name: req.user.first_name,
      middle_name: req.user.middle_name,
      last_name: req.user.last_name,
      titleDefense: result.rows,
      adviser: req.session.adviser,
      committee: req.session.committee,
      admin:req.session.admin

    });
  });
});

app.get('/faculty/dp1', isFaculty,function(req, res) {
  res.render('cpe_faculty/faculty_dp_1',{
      first_name: req.user.first_name,
      middle_name: req.user.middle_name,
      last_name: req.user.last_name,
      adviser: req.session.adviser,
      committee: req.session.committee,
      admin:req.session.admin

  });
});
app.post('/faculty/title_defense/panel', isFaculty,function(req, res) {
    adviser.insertPanelMember({panelid:req.body.defense_id,facultyid: req.user.id},function(result){
      res.redirect('/faculty/title_defense')
  });
});  
app.post('/faculty/title_defense/headpanel', isFaculty,function(req, res) {
  adviser.insertHeadPanelMember({panelid:req.body.defense_id,facultyid: req.user.id},function(result){
        adviser.defenseGrade({grade:req.body.grade,defense_id: req.body.defense_id},function(result){
           res.redirect('/faculty/title_defense')
  });     
  });
});

app.get('/faculty/dp2', isFaculty, function(req, res) {
  res.render('cpe_faculty/faculty_dp_2',{
      first_name: req.user.first_name,
      middle_name: req.user.middle_name,
      last_name: req.user.last_name,
      adviser: req.session.adviser,
     committee: req.session.committee,
     admin:req.session.admin
  });
});

app.get('/faculty/schedule', isFaculty, function(req, res) {
  res.render('cpe_faculty/faculty_schedule',{
      first_name: req.user.first_name,
      middle_name: req.user.middle_name,
      last_name: req.user.last_name,
      admin:req.session.admin
  });
});

app.get('/faculty/settings', isFaculty, function(req, res) {
  res.render('cpe_faculty/faculty_account_settings',{
      first_name: req.user.first_name,
      middle_name: req.user.middle_name,
      last_name: req.user.last_name,
      admin:req.session.admin
  });
});
//FACULTY---------------------------------------------

//STUDENT---------------------------------------------
app.get('/students/home', isStudent, function(req, res) {
  student.studentGroupmates({group_id:req.session.group_id}, function(group_id) {
    student.studentAdviser({student_id: req.user.id}, function(studentAdviser) {
      console.log(req.user.image);
      res.render('cpe_students/students_home',{  
        first_name: req.user.first_name,
        middle_name: req.user.middle_name,
        last_name: req.user.last_name,
        adviser_first_name:   studentAdviser.rows[0].first_name,
        adviser_middle_name:  studentAdviser.rows[0].middle_name,
        adviser_last_name:    studentAdviser.rows[0].last_name,
        batch_year:           studentAdviser.rows[0].batch_year,
        section:              studentAdviser.rows[0].section,
        image: req.user.image,
        group_id: group_id.rows
      });
    });
  });
});

app.post('/students/upload/image',isStudent, upload.single('file-to-upload'), function (req, res) {
    console.log('The filename is ' + res.req.file.filename);
    student.uploadImage(
      {
        id: req.user.id,
        image: res.req.file.filename

      },
      function(callback){  
        console.log(callback)
       res.redirect('/students/home');
       
       });
});

app.get('/students/mor',isStudent, function(req, res) {
    var proposal_list;
    var approval_list;
    var vote = [];
   student.approvalList({groupid: req.session.group_id},function(approvalList){
      approval_list =  approvalList.rows
   for (var i = 0 ; i< approvalList.rows.length;i++){
    if (approvalList.rows[i].count >= 7){
       vote.push(true)
      }
    else{
      vote.push(false)
    }
    }

  });  
  student.proposalList({groupid: req.session.group_id},function(proposalList){
    console.log(vote)
    for (var i = 0 ; i< approval_list.length;i++){
      approval_list[i].tally = vote[i]
    }
    console.log(approval_list)
    res.render('cpe_students/students_mor',{
        first_name: req.user.first_name,
        middle_name: req.user.middle_name,
        last_name: req.user.last_name,
      proposals:  proposalList.rows,
      approvals: approval_list
    });
  })  

});
app.post('/students/mor/proceed',isStudent, function (req, res) {
    student.updateThesisStatus(
      {
        thesisid: req.body.thesis_id,
        stage: 6
      },
      function(callback){  
        student.insertToDefense(
          {
            thesisid: req.body.thesis_id,
            type: 'MOR'
          },
          function(callback){  
            res.redirect('/students/mor')
           
           });
       
       });
});

app.post('/students/mor/add',isStudent, upload.single('file-to-upload'), function (req, res) {
    console.log('The filename is ' + res.req.file.filename);
    student.addProposal(
      {
        title: req.body.proposal_title,
        abstract: req.body.proposal_abstract,
        groupid: req.session.group_id,
        filename: res.req.file.filename

      },
      function(callback){  
        console.log(callback)
       res.redirect('/students/mor');
       
       });
});

app.get('/students/dp1', isStudent,function(req, res) {
	res.render('cpe_students/students_dp_1',{
        first_name: req.user.first_name,
        middle_name: req.user.middle_name,
        last_name: req.user.last_name
		
	});
});

app.get('/students/dp2',isStudent, function(req, res) {
	res.render('cpe_students/students_dp_2',{
        first_name: req.user.first_name,
        middle_name: req.user.middle_name,
        last_name: req.user.last_name
		
	});
});

app.get('/students/schedule',isStudent, function(req, res) {
	res.render('cpe_students/students_schedule',{
        first_name: req.user.first_name,
        middle_name: req.user.middle_name,
        last_name: req.user.last_name
		
	});
});

app.get('/students/adviser',isStudent, function(req, res) {
	res.render('cpe_students/students_adviser',{
        first_name: req.user.first_name,
        middle_name: req.user.middle_name,
        last_name: req.user.last_name
		
	});
});

app.get('/students/settings', isStudent,function(req, res) {
	res.render('cpe_students/students_account_settings',{
        first_name: req.user.first_name,
        middle_name: req.user.middle_name,
        last_name: req.user.last_name
		
	});
});
//STUDENT--------

//GUEST PANEL----
app.get('/guest_panel/home',isGuest,function(req, res) {
  res.render('cpe_guest_panel/guest_panel_home',{
        first_name: req.user.first_name,
        middle_name: req.user.middle_name,
        last_name: req.user.last_name
    
  });
});

app.get('/guest_panel/mor', function(req, res) {
  res.render('cpe_guest_panel/guest_panel_mor',{
        first_name: req.user.first_name,
        middle_name: req.user.middle_name,
        last_name: req.user.last_name
    
  });
});

app.get('/guest_panel/dp1', function(req, res) {
  res.render('cpe_guest_panel/guest_panel_dp_1',{
        first_name: req.user.first_name,
        middle_name: req.user.middle_name,
        last_name: req.user.last_name
    
  });
});

app.get('/guest_panel/dp2', function(req, res) {
  res.render('cpe_guest_panel/guest_panel_dp_2',{
        first_name: req.user.first_name,
        middle_name: req.user.middle_name,
        last_name: req.user.last_name
    
  });
});

app.get('/guest_panel/settings', function(req, res) {
  res.render('cpe_guest_panel/guest_panel_account_settings',{
        first_name: req.user.first_name,
        middle_name: req.user.middle_name,
        last_name: req.user.last_name
    
  });
});
//GUEST PANEL---------------------------------------------
app.listen(app.get('port'), isStudent,function() {
	console.log('Server started at port 3000');
});
