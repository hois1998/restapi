var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

//var indexRouter = require('./routes/index');
//var usersRouter = require('./routes/users');
//var dbRouter = require('./routes/db');
var streaming_termination = require('./routes/streaming_termination');
var get_testRouter = require('./routes/get_test');
//var testRouter = require('./routes/test');
var login = require('./routes/login');
var logout = require('./routes/logout');
var sign_up = require('./routes/sign_up');
var add_student_data = require('./routes/add_student_data');
var add_exam_data = require('./routes/add_exam_data');
var delete_exam_data = require('./routes/delete_exam_data');
var Identification = require('./routes/Identification');
var superv_endpoint = require('./routes/superv_endpoint');
var superv_endpoint_pre = require('./routes/superv_endpoint_pre');
var hlsFinish = require('./routes/hlsFinish');
var admin_admit = require('./routes/admin_admit');
var change_password = require('./routes/change_password');
var get_test_pre = require('./routes/get_test_pre');
var previousvideo_student_list = require('./routes/previousvideo_student_list');
var return_endpoint = require('./routes/return_endpoint');
//var exam_deactivation = require('./routes/exam_deactivation');
var student_list = require('./routes/student_list');
var delete_student_data = require('./routes/delete_student_data');

var app = express();

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
//app.use('/test', testRouter);
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
