<template>
  <div id="page">
    <div id="bodys">
      <el-container>
        <el-header>
          后勤工作处报修系统 管理员登录
        </el-header>
        <div id="inputs" v-loading="loading">
          <el-input
            placeholder="用户名"
            v-model="adminName"
            clearable>
            <template slot="prepend">用户名</template>
          </el-input>
          <el-input
            placeholder="密码"
            v-model="password"
            type="password"
            clearable>
            <template slot="prepend">密&nbsp;&nbsp;&nbsp;&nbsp;码</template>
          </el-input>
        </div>
        <el-row>
          <el-button type="success" @click="submit" plain>登录</el-button>
        </el-row>
      </el-container>
    </div>
  </div>
</template>

<script>
import qs from 'qs'
export default {
  name: 'Login',
  data () {
    return {
      adminName: '',
      password: '',
      loading: false,
      host: 'http://hq.hbjg1950.com/index.php/index/repairs/'
    }
  },
  methods: {
    submit: function () {
      if (this.adminName === '' || this.password === '') {
        this.$message.error('用户名以及密码不能为空')
        return
      }
      let self = this
      this.loading = true
      this.$http.post(self.host + 'landadmin', qs.stringify({
        name: this.adminName,
        password: this.password
      })
      )
        .then(function (response) {
          if (response.data.code === 0) {
            self.$message({
              message: '登录成功！',
              type: 'success'
            })
            setTimeout(function () {
              self.$router.push('/')
            }, 2000)
          } else {
            self.$message({
              message: response.data.msg,
              type: 'error'
            })
            self.loading = false
          }
        })
        .catch(function (e) {
          self.$message.error('出错了，请重试')
          self.loading = false
        })
    }
  }
}
</script>
<style scoped>
  #page {
    background: url('../../assets/bj.jpg') no-repeat center;
    height: 100%;
    width: 100%;
    position: fixed;
    top: 0;
  }
  #bodys {
    margin-top: 8rem;
  }
  #inputs {
    margin-top: 1rem;
    margin-bottom: 1rem;
  }
  .el-container {
    width: 40rem;
    border-radius: 0.5rem;
    border: 1px solid #ccc;
    margin: auto;
    text-align: center;
    background: #fff;
  }
  .el-input {
    margin: auto;
    margin-top: 1rem;
    width: 50%;
  }
  .el-row {
    padding-top: 1rem;
    margin-bottom: 1rem;
    border-top: 1px solid #ccc;
  }
  .el-header, .el-footer {
    background-color: #3498e9;
    color: #fff;
    text-align: center;
    line-height: 60px;
    border-radius: 0.5rem 0.5rem 0 0 ;
  }
</style>
