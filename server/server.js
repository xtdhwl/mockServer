'use strict';

const PORT = 8001;
const HOST = '0.0.0.0';

//
//kill -9 $(lsof -ti tcp:8001) | npm start

var http = require('http');
var url = require('url');
var Mock = require('mockjs');
var sqlite3 = require('sqlite3').verbose();
var db;

function createDb(){
	db = new sqlite3.Database("mock.db", createTable)
}

function createTable(){
	//data
	db.run("CREATE TABLE IF NOT EXISTS mock(" 
                + " id INTEGER PRIMARY KEY NOT NULL," 
		+ " action TEXT,"
                + " account TEXT,"
                + " data TEXT)");
}

createDb();

/**
* 插入数据库
* insert into mock (action, account, data) values('/hello', '130', 'test');
* data{action, account, data}
*/
function insertMockDao(data, callback){
    console.log("insertMockDao:" + JSON.stringify(data));
    db.run('INSERT INTO MOCK (action, account, data) values(?, ?, ?)', [
      	data.action, data.account? data.account : "", data.data
    ], callback);   
}

/**
* 更新数据库
* update mock set action='/hello1', account='131', data ='test1' where action = '/hello'
*/       
function updateMockDao(data, callback){
    console.log("updateMockDao:" + JSON.stringify(data));
	db.run('UPDATE mock SET data=? WHERE id = ?',[ 
            data.data,
            data.id
	], callback); 
}

/**
* 查询数据库
* select * from mock where action='/hello';
* 
*/
function selectMockDao(data, callback){
   console.log("selectMockDao:" + JSON.stringify(data));
  	 db.get('SELECT * FROM mock WHERE action = ? and account = ?', [
   		data.action, data.account? data.account : "" 
   	 ], callback);
}



class MockResponse{

}

/**
* 处理更新事件
* actionReq{mothod, params}
*/
//curl http://127.0.0.1:8080/action -d '{"method":"queryMock","params":{"action":"/hello"}}';
//curl http://127.0.0.1:8080/action -d '{"method":"updateMock","params":{"action":"/hello","data":{"message":"test5"}}}';
function updateAction(req, res, actionReq){
    var mockData ={
	    method  : actionReq.method,
        id      : -1,
	    action	: actionReq.params['action'],
	    account	: actionReq.params['account'],
	    data	: actionReq.params['data']
    };
    var success = false;
    var promise = selectMockDao(mockData);
    if(mockData.method === "queryMock"){
	    console.log("updateAction queryMock");
        selectMockDao(mockData, (err, row)=>{
            console.log("sqlite3");
            console.log(err);
            console.log(row);
	        if(err){
               res.end();
	        }else{
                res.end(row.data);
	        }
        });
    }else if(mockData.method === "updateMock"){
	    console.log("updateAction updateMock");
        selectMockDao(mockData, (err, row)=>{
	        console.log("sqlite3");
            console.log(err);
            console.log(row);
            if(err){
               response(res, "2", "查询失败");
               return;
            }
	        if(row){
               mockData.id = row.id;
               updateMockDao(mockData, (err)=>{
 		            var success = !err;
		            var code =  success ? 0 : -1;
             	    var message =  success ? '成功' : '失败';
	     	        response(res, code, message);
               });
	        }else{
               insertMockDao(mockData, (err)=>{
	                var success = !err;
	                var code =  success ? 0 : -1;
                    var message =  success ? '成功' : '失败';
	                response(res, code, message);
	            });
	        }
        });
    }
}



function mockAction(req, res){
    console.log("mockAction");
    var mockData = {
        action : req.url,
        account: req.headers["58con-account"]	
    };
    selectMockDao(mockData, (err, row)=>{
	 console.log("sqlite3");
         console.log(err);
         console.log(row);
	 if(row){
	    var result = Mock.mock(JSON.parse(row.data));
	    res.end(JSON.stringify(result));
         }else{
	    res.end();
         }
    });
}

function response(res, code, message, data){
	var result = {
		    code   : code,
		    message: message,
		    data   : data
    	}
	 res.end(JSON.stringify(result));
}

function doAction(req, res){
       //console.log(res);
         let body = []; 
         req.on('data', (chunk)=>{
                 body.push(chunk);
         }).on('end', ()=>{
              try{
                    body = Buffer.concat(body).toString();
                    res.writeHead(200,{'Content-Type':'text/plain;charset=UTF-8'});
                 
                    var reqUrl = url.parse(req.url);
		            console.log("==========================");
		            console.log(reqUrl);
		            console.log(body);
		            console.log("==========================");
                    if(reqUrl.path == '/action'){
                         updateAction(req, res,JSON.parse(body.toString()));
                    }else{  
                         mockAction(req, res);
                    }
              }catch(e){
                 console.log(e);
                 res.end(e.toString());
              }
         });
}


const proxy = http.createServer((req, res)=>{
		doAction(req, res);
	});

proxy.listen(PORT, HOST);


process.on('exit', (code)=>{
	console.log('server exit code:'+ code);
});

process.on('uncaughtException', (err)=>{
	proxy.close();
	console.log('server uncaughtException:'+ err);
	console.log(err);
	process.exit();
});


console.log(`Running on http://${HOST}:${PORT}`);
