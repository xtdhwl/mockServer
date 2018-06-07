<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <div class="container">
      <div class="action">
        <textarea rows="1" placeholder="url" v-model="action"></textarea>
        <button @click="queryClick()">查询</button>
      </div>
      <textarea class="content" placeholder="报文" v-model="data"></textarea>
      <button class="submit" @click="submitClick()">提交</button>
    </div>
  </div>
</template>

<script>

  import Api from '../store/api.js';

  export default {
    name: 'MockPage',
    data() {
      return {
        msg: 'Android Mock',
        action: '/tools/app/version',
        data: ''
      }
    },
    methods: {
      goPage() {
        this.$router.push({path: "mock"});
      },


      queryClick() {
        // console.log(this.packet.action);
        console.log(this.action);
        let self = this;
        let api = new Api();
        api.requstQueryPacket(this.action)
          .then(function (request) {
            console.log(request);
            self.data = request.responseText;
          }).catch(function (request) {
          console.log(request);
          self.data = "请求失败";
        });
      },

      submitClick() {
        let packet = {
          action: this.action + "",
          data: this.data + ""
        };
        console.log(packet);

        let self = this;
        let api = new Api();
        api.requstAddPacket(packet).then(function (request) {
          console.log(request);
          var response = JSON.parse(request.responseText);
          alert(response.message)
        }).catch(function (request) {
          console.log(request);
          self.data = "请求失败";
        });
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  h1, h2 {
    font-weight: normal;
  }

  .container {
    display: flex;
    flex-direction: column;
    align-content: center;
    align-items: center;
  }

  .action {
    display: flex;
    width: 40%;
    flex-direction: row;
  }

  .action textarea {
    flex: 1;
  }

  .action button {
    margin: 0px 20px 0px 20px;
  }

  .content {
    width: 40%;
    height: 280px;
    margin: 20px 0px 0px 0px;
  }

  .submit {
    margin: 20px 0px 0px 0px;
  }

</style>
