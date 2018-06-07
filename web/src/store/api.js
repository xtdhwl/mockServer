import axios from 'axios';

// 使用代理
const HOST = 'http://localhost:8080';


function fetch(data) {
  return new Promise(function (resolve, reject) {
    var url = HOST + '/action';
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
      if (request.readyState === 4) { // 成功完成
        if (request.status === 200) {
          resolve(request)
        } else {
          reject(request);
        }
      }
    };
    request.open('post', url);

    console.log(JSON.stringify(data));
    request.send(JSON.stringify(data));
  })
}


const packet = {
  action: "",
  data: ""
};


export default class Api {
  constructor() {
  }

  requstAddPacket(packet) {
    return fetch({
      "method": "updateMock",
      "params": {
        "action": packet.action + "",
        "data": packet.data + ""
      }
    })
  }

  requstQueryPacket(action) {
    return fetch({
      "method": "queryMock",
      "params": {
        "action": action
      }
    })
  }
}
