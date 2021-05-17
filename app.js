let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');

//let indexRouter = require('./routes/index');
//let usersRouter = require('./routes/users');
//let dbRouter = require('./routes/db')aa12345;
let streaming_termination = require('./routes/streaming_termination');
let get_testRouter = require('./routes/get_test');
//let testRouter = require('./routes/test');
let login = require('./routes/login');
let logout = require('./routes/logout');
let sign_up = require('./routes/sign_up');
let add_student_data = require('./routes/add_student_data');
let add_exam_data = require('./routes/add_exam_data');
let delete_exam_data = require('./routes/delete_exam_data');
let Identification = require('./routes/Identification');
let superv_endpoint = require('./routes/superv_endpoint');
let superv_endpoint_pre = require('./routes/superv_endpoint_pre');
let hlsFinish = require('./routes/hlsFinish');
let admin_admit = require('./routes/admin_admit');
let change_password = require('./routes/change_password');
let get_test_pre = require('./routes/get_test_pre');
let previousvideo_student_list = require('./routes/previousvideo_student_list');
let return_endpoint = require('./routes/return_endpoint');
//let exam_deactivation = require('./routes/exam_deactivation');
let student_list = require('./routes/student_list');
let delete_student_data = require('./routes/delete_student_data');
let server_to_server = require('./routes/server_to_server');
let object_detection = require('./routes/object_detection');
let face_recognition = require('./routes/face_recognition');
// let streaming_start = require('./routes/streaming_start');

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//app.use('/', indexRouter);
//app.use('/users', usersRouter);
//app.use('/db', dbRouter);
app.use('/streaming_termination', streaming_termination);
app.use('/get_test', get_testRouter);
//app.use('/test', testRouter)111;
app.use('/login', login);
app.use('/logout', logout);
app.use('/sign_up', sign_up);
app.use('/add_student_data', add_student_data);
app.use('/add_exam_data', add_exam_data);
app.use('/delete_exam_data', delete_exam_data);
app.use('/Identification', Identification);
app.use('/superv_endpoint', superv_endpoint);
app.use('/superv_endpoint_pre', superv_endpoint_pre);
app.use('/hlsFinish', hlsFinish);
app.use('/admin_admit', admin_admit);
app.use('/change_password', change_password);
app.use('/get_test_pre', get_test_pre);
app.use('/previousvideo_student_list', previousvideo_student_list);
app.use('/return_endpoint', return_endpoint);
//app.use('/exam_deactivation', exam_deactivation);
app.use('/student_list', student_list);
app.use('/delete_student_data', delete_student_data);
app.use('/server_to_server', server_to_server);
app.use('/object_detection', object_detection);
app.use('/face_recognition', face_recognition);
// app.use('/streaming_start', streaming_start);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
