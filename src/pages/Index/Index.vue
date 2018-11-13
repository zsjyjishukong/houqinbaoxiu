<template>
  <div id="page"
       v-loading="pageLoading"
       element-loading-text="拼命加载中"
       element-loading-spinner="el-icon-loading"
       element-loading-background="rgba(0, 0, 0, 0.8)">
    <header>
      河北建筑工程学院后勤处报修管理系统
      <span class="right">
        <img class="header-img" src="@/assets/exit.png" alt="退出" title="退出登录" @click="exitAdmin">
      </span>
    </header>
    <div id="nav">
      <span class="right">
        <div class="nav-menu" @click="selectRepair">
          <el-tag>查询报修</el-tag>
        </div>
        <div class="nav-menu" @click="dialogFormVisible = true">
          <el-tag>添加管理员</el-tag>
        </div>
        <div class="nav-menu" @click="selectAdminList">
          <el-tag>查看管理员</el-tag>
        </div>
      </span>
    </div>
    <!--以下是报修信息的显示-->
    <div id="repair-information">
      <el-table
        :data="tableData"
        border
        style="width: 100%"
        height="29rem"
        v-loading="repairTableLoading">
        <el-table-column
          prop="id"
          label="报修号"
          width="90"
          sortable>
        </el-table-column>
        <el-table-column
          prop="time"
          label="报修日期"
          width="160"
          sortable>
        </el-table-column>
        <el-table-column
          prop="address"
          label="报修地点"
          width="200"
          sortable>
        </el-table-column>
        <el-table-column
          prop="content"
          label="报修内容"
          width="300">
        </el-table-column>
        <el-table-column
          prop="tel"
          label="联系电话"
          width="120">
        </el-table-column>
        <el-table-column
          prop="status"
          label="处理状态"
          width="120"
          sortable>
        </el-table-column>
        <el-table-column
          label="操作"
          width="202">
          <template slot-scope="scope">
            <el-button class="repair-form-button" @click="selectARepair(scope.row.id)" type="text" size="small">查看</el-button>
            <el-popover
              placement="top"
              width="160"
              v-model="scope.row.confirmShowOrNot"
              >
              <div v-loading="changeStatusPopoutLoading">
                <p>确定将ID为<span style="color: #E6A23C">{{ scope.row.id }}</span>的项目的状态由 <span style="color: #E6A23C">{{scope.row.status}} </span>更改为<span style="color: #E6A23C"> {{ scope.row.status === '待确认' ? '维修中': (scope.row.status === '维修中' ? '已维修' : '未知状态') }}</span>吗？</p>
                <div style="text-align: right; margin: 0">
                  <el-button size="mini" type="text" @click="scope.row.confirmShowOrNot = false">取消</el-button>
                  <el-button type="primary" size="mini"  @click="changeStatus(scope.row.id,scope.row)">确定</el-button>
                </div>
              </div>
              <el-button class="repair-form-button" slot="reference" type="text" size="small" v-bind:disabled="(scope.row.status === '已维修'||scope.row.status === '已评价') ? true : false" >更改状态</el-button>
            </el-popover>
            <el-button class="repair-form-button" @click="startChat(scope.row.id)" type="text" size="small"><el-badge :value="scope.row.unread" :max="9" :hidden="scope.row.unread === 0 ? true : false" class="item">聊天</el-badge></el-button>
            <el-dialog
              title="详细信息"
              :visible.sync="selectARepairDialogVisible"
              width="30%">
              <el-form ref="selectARepairDetail" :model="selectARepairDetail" label-width="80px" align="center" size="mini">
                <el-form-item label="项目ID:">
                  <el-form-item>{{selectARepairDetail.id}}</el-form-item>
                </el-form-item>
                <el-form-item label="报修地址:">
                  <el-form-item>{{selectARepairDetail.address}}</el-form-item>
                </el-form-item>
                <el-form-item label="报修内容:">
                  <el-form-item>{{selectARepairDetail.content}}</el-form-item>
                </el-form-item>
                <el-form-item label="联系电话:">
                  <el-form-item>{{selectARepairDetail.tel}}</el-form-item>
                </el-form-item>
                <el-form-item label="详情图片:">
                  <el-form-item><img :src="selectARepairDetail.img" style="width: 60%"/></el-form-item>
                </el-form-item>
                <el-form-item label="报修用户:">
                  <el-form-item>{{selectARepairDetail.openid}}</el-form-item>
                </el-form-item>
                <el-form-item label="报修时间:">
                  <el-popover
                    placement="top-start"
                    title="维修进度"
                    width="200"
                    trigger="hover">
                    <el-steps direction="vertical" :active="selectARepairDetail.status == 3 ? 4 :selectARepairDetail.status">
                      <el-step title="已提交" v-bind:description="selectARepairDetailStatus1"></el-step>
                      <el-step title="维修中" v-bind:description="selectARepairDetailStatus2"></el-step>
                      <el-step title="已维修" v-bind:description="selectARepairDetailStatus3"></el-step>
                      <el-step title="已评论"></el-step>
                    </el-steps>
                    <el-form-item slot="reference"><span style="color:#409EFF">{{selectARepairDetail.time}}</span></el-form-item>
                  </el-popover>
                </el-form-item>
                <el-form-item label="用户评价" v-if="selectARepairDetail.status === 3 ? true : false">
                  <el-form-item>{{selectARepairDetail.evaluation}}</el-form-item>
                </el-form-item>
                <el-button type="primary" @click="startChat(selectARepairDetail.id)">聊天</el-button>
                <el-button @click="selectARepairDialogVisible = false">取消</el-button>
              </el-form>
            </el-dialog>
          </template>
        </el-table-column>
      </el-table>
      <!--聊天界面-->
      <el-dialog v-bind:title="chatTitle" :visible.sync="chatDialogShow" width="64rem" id="dialogs">
        <div id="chatBody">
          <div class="messages" v-for="aMessage in chatData" :key="aMessage.rawTime">
            <div class="messages-time">
              <span style="display: inline-block;
                            padding: 0 5px;
                            font-size: 12px;
                            color: #fff;
                            border-radius: 2px;
                            background-color: #DADADA;">
                {{aMessage.time}}
              </span>
            </div>
            <div class="message-user-left" v-show="aMessage.left">
              <img :src="aMessage.img" style="border-radius: 66px;height: 3rem" />
            </div>
            <div class="message-user-right" v-show="!aMessage.left">
              <img :src="aMessage.img" style="border-radius: 66px; height:3rem"/>
            </div>
            <div class="message-body">
              <div class="message-left" v-show="aMessage.left">
                <div class="message-nickname" style="text-align: left">{{aMessage.nickname}}</div>
                <div class="message-content">{{aMessage.content}}</div>
              </div>
              <div class="message-right" v-show="!aMessage.left">
                <div class="message-nickname" style="text-align: right">{{aMessage.nickname}}</div>
                <div class="message-content">{{aMessage.content}}</div>
              </div>
              <br style="clear: both">
            </div>
          </div>
        </div>
        <div id="chatFoot">
          <el-form :inline="true" class="demo-form-inline">
            <el-input class="message-input" v-model="newChatData"></el-input>
            <el-button type="success" id="send" @click="sendMessage" v-loading="sendMessageButtonLoading">发送</el-button>
          </el-form>
        </div>
      </el-dialog>
    </div>
    <!--管理员管理弹窗-->
    <div>
      <el-dialog :visible.sync="adminListShow" title="管理员列表">
        <el-table
          :data="adminList"
          border
          style="width: 100%"
          max-height="500">
          <el-table-column
            fixed
            prop="id"
            label="ID"
            width="120">
          </el-table-column>
          <el-table-column
            prop="nickname"
            label="昵称"
            width="120">
          </el-table-column>
          <el-table-column
            prop="openid"
            label="openid"
            width="120">
          </el-table-column>
          <el-table-column
            prop="layer"
            label="权限"
            width="200">
          </el-table-column>
          <el-table-column
            label="操作"
            width="167">
            <template slot-scope="scope">
              <el-button type="text" size="small" @click="editAdmin(scope.row)">编辑</el-button>
              <el-popover
                placement="top"
                width="160"
                v-model="scope.row.confirmShowOrNot"
                style="z-index: 10;">
                <div v-loading="deleteAdminLoading">
                  <p>确定删除管理员<span style="color:#E6A23C">{{scope.row.nickname}}吗？</span></p>
                  <div style="text-align: right; margin: 0">
                    <el-button size="mini" type="text" @click="scope.row.confirmShowOrNot = false">取消</el-button>
                    <el-button type="primary" size="mini" @click="deleteAdmin(scope.row.id, scope)">确定</el-button>
                  </div>
                </div>
                <el-button type="text" size="small" slot="reference" @click="scope.row.confirmShowOrNot = true">删除</el-button>
              </el-popover>
            </template>
          </el-table-column>
        </el-table>
        <!--管理员详情-->
        <el-dialog
          width="30%"
          title="编辑管理员信息"
          :visible.sync="editAdminDetailShow"
          append-to-body>
          <el-form ref="adminDetail" :model="adminDetail" label-width="120px" v-loading="editAdminLoading">
            <el-form-item label="管理员 ID : ">
              <el-form-item style="text-align: center">{{adminDetail.id}}</el-form-item>
            </el-form-item>
            <el-form-item label="管理员昵称 : ">
              <el-input v-model="adminDetail.nickname"></el-input>
            </el-form-item>
            <el-form-item label="管理员密码 : ">
              <el-input v-model="adminDetail.password"></el-input>
            </el-form-item>
            <el-form-item label="管理员权限 : ">
              <el-select v-model="adminDetail.layer" placeholder="请选择管理员权限">
                <el-option label="普通管理员" value="1"></el-option>
                <el-option label="超级管理员" value="2"></el-option>
              </el-select>
            </el-form-item>
            <div style="text-align: center">
              <el-button type="success" @click="updateAdmin">确定</el-button>
              <el-button @click="editAdminDetailShow = false">取消</el-button>
            </div>
          </el-form>
        </el-dialog>
      </el-dialog>
    </div>
    <div id="footer">
      <el-footer>
        CopyRight &copy; 新媒体工作室 技术支持 <br> <a href="https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MjM5OTI1MTI4MQ==&scene=126#wechat_redirect">掌上建院</a>  建院自主数字化服务系统引领者
      </el-footer>
    </div>
    <!--以下div为添加管理员弹框-->
    <div>
      <el-dialog title="添加管理员" :visible.sync="dialogFormVisible" >
      <el-form :model="addAdminForm" v-loading="addAdminLoading">
        <el-form-item label="用户名" :label-width="formLabelWidth">
          <el-input v-model="addAdminForm.username" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码" :label-width="formLabelWidth">
          <el-input v-model="addAdminForm.password" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="openid" :label-width="formLabelWidth">
          <el-input v-model="addAdminForm.openid" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="管理员权限" :label-width="formLabelWidth">
          <el-select v-model="addAdminForm.layer" placeholder="请选择管理员权限">
            <el-option label="普通管理员" value="1"></el-option>
            <el-option label="超级管理员" value="2"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitAddAdmin">确 定</el-button>
      </div>
    </el-dialog>
    </div>
  </div>
</template>

<script>
import qs from 'qs'
export default {
  name: 'Index',
  data () {
    return {
      host: 'http://hq.hbjg1950.com/index.php/index/repairs/',
      dialogFormVisible: false,
      repairTableLoading: false,
      changeStatusPopoutLoading: false,
      selectARepairDialogVisible: false,
      chatDialogShow: false,
      pageLoading: false,
      sendMessageButtonLoading: false,
      editAdminDetailShow: false,
      editAdminLoading: false,
      adminListShow: false,
      deleteAdminLoading: false,
      chatTitle: '',
      intervalID: 0,
      thisUserOpenid: '',
      adminList: [],
      thisUserNickname: '暂未获取',
      thisUserImg: '#',
      newChatData: '',
      chatNum: 6,
      addAdminForm: {
        username: '',
        password: '',
        openid: '',
        layer: ''
      },
      adminDetail: '',
      formLabelWidth: '7.5rem',
      tableData: [],
      addAdminLoading: false,
      selectARepairDetail: {
        address: '',
        content: '',
        id: 0,
        tel: '',
        img: '',
        openid: '',
        time: '',
        status: 0,
        evaluation: '',
        speed: {
          admin0: '',
          time0: '',
          admin1: '',
          time1: '',
          admin2: '',
          time2: '',
          admin3: '',
          time3: ''
        }
      },
      chatData: []
    }
  },
  methods: {
    add0: function (m) {
      if (m < 10) {
        return '0' + m
      } else {
        return m
      }
    },
    handleTime: function (time) {
      time = time + '000'
      time = new Date(parseInt(time))
      let y = time.getFullYear()
      let m = time.getMonth() + 1
      let d = time.getDate()
      let h = time.getHours()
      let mm = time.getMinutes()
      let s = time.getSeconds()
      time = y + '-' + m + '-' + d + ' ' + this.add0(h) + ':' + this.add0(mm) + ':' + this.add0(s)
      return time
    },
    handleChatTime: function (time) {
      time = time + '000'
      time = new Date(parseInt(time))
      let y = time.getFullYear()
      let m = time.getMonth() + 1
      let d = time.getDate()
      let h = time.getHours()
      let mm = time.getMinutes()
      time = y + '/' + m + '/' + d + ' ' + this.add0(h) + ':' + this.add0(mm)
      return time
    },
    selectRepair: function () {
      this.repairTableLoading = true
      let self = this
      this.$http.get(self.host + 'selectAdminRepair')
        .then(function (response) {
          if (response.data.code === 0) {
            self.repairTableLoading = false
            if (response.data.data === []) {
              return
            }
            self.tableData.splice(0)
            for (let i = 0; i < response.data.data.length; i++) {
              let res = response.data.data[i]
              let time = self.handleTime(response.data.data[i]['time'])
              let content = res.content
              if (content.length > 40) {
                content = content.substr(0, 35) + '……'
              }
              let table = {
                id: res.id,
                time: time,
                address: res.address,
                content: content,
                tel: res.tel,
                status: res.status === 0 ? '待确认' : (res.status === 1 ? '维修中' : (res.status === 2 ? '已维修' : '已评价')),
                unread: res.unread,
                confirmShowOrNot: false,
                speed: {
                  admin0: '',
                  time0: 0,
                  admin1: ''
                }
              }
              self.tableData.push(table)
            }
          } else if (response.data.code === 2) {
            self.$message.error('尚未登录，请登陆后操作')
            setTimeout(function () {
              self.$router.push('/login')
            }, 2000)
          } else {
            self.repairTableLoading = false
            self.$message.error('未知错误')
          }
        })
        .catch(function () {
          self.repairTableLoading = false
          self.$message.error('网络错误或主机错误')
        })
    },
    exitAdmin: function () {
      let self = this
      this.$http.get(self.host + 'exitAdmin')
        .then(function (response) {
          if (response.data.code === 0) {
            self.$message.success('退出登录成功')
            self.$router.push('/login')
          } else {
            self.$message.error('未知错误')
          }
        })
        .catch(function () {
          self.$message.error('网络错误或主机错误')
        })
    },
    submitAddAdmin: function () {
      let self = this
      if (this.addAdminForm.username === '' || this.addAdminForm.password === '' || this.addAdminForm.openid === '' || this.addAdminForm.layer === '') {
        this.$message.error('表单信息不能为空，请检查')
      } else {
        this.addAdminLoading = true
        this.$http.post(self.host + 'insertAdmin', qs.stringify({
          adminName: this.addAdminForm.username,
          password: this.addAdminForm.password,
          openid: this.addAdminForm.openid,
          layer: this.addAdminForm.layer
        })
        )
          .then(function (response) {
            if (response.data.code === 0) {
              self.$message({
                message: '添加成功！',
                type: 'success'
              })
              setTimeout(function () {
                self.addAdminLoading = false
                self.dialogFormVisible = false
                self.addAdminForm.username = ''
                self.addAdminForm.password = ''
                self.addAdminForm.openid = ''
                self.addAdminForm.layer = ''
              }, 1500)
            } else if (response.data.code === 1) {
              self.$message({
                message: response.data.msg,
                type: 'error'
              })
              self.addAdminLoading = false
            } else if (response.data.code === 2) {
              self.$message({
                message: '您尚未登陆，请登录后操作',
                type: 'error'
              })
              setTimeout(function () {
                self.$router.push('/login')
              }, 2000)
            }
          })
          .catch(function (e) {
            self.$message.error('出错了，请重试')
            self.loading = false
          })
      }
    },
    startChat: function (e) {
      this.chatDialogShow = true
      this.chatTitle = '在工单' + e + '号下的聊天'
      this.chatId = e
      this.selectChat()
      this.updated()
    },
    selectChat: function () {
      let self = this
      this.$http.post(self.host + 'selectchat', qs.stringify({
        id: self.chatId
      }))
        .then(function (response) {
          if (response.data.code === 0) {
            self.chatData = []
            self.chatData.splice(0)
            let chatData = response.data.data
            self.thisUserOpenid = response.data.openid
            self.thisUserNickname = response.data.nickname
            self.thisUserImg = response.data.img
            for (let i in chatData) {
              let left = 0
              if (chatData[i]['from_user'] !== self.thisUserOpenid) {
                left = 1
              }
              let time = chatData[i]['chat_time']
              time = self.handleChatTime(time)
              let data = {
                fromUser: chatData[i]['from_user'],
                left: left,
                time: time,
                rawTime: chatData[i]['chat_time'],
                content: chatData[i]['content'],
                nickname: chatData[i]['nickname'],
                img: chatData[i]['img']
              }
              self.chatData.push(data)
            }
            self.updated()
          } else {
            self.$message.error('未知错误')
          }
        })
        .catch(function () {
          self.$message.error('网络错误或主机错误')
        })
    },
    sendMessage: function () {
      let self = this
      let newChatData = this.newChatData.trim()
      this.newChatData = ''
      if (newChatData === '') {
        this.$message.error('聊天信息不能为空')
        return
      }
      this.sendMessageButtonLoading = true
      let data = {
        fromUser: this.thisUserOpenid,
        left: 0,
        time: this.handleChatTime((new Date()).getTime() / 1000),
        rawTime: (new Date()).getTime(),
        content: newChatData,
        nickname: this.thisUserNickname,
        img: this.thisUserImg
      }
      self.chatData.push(data)
      console.log(self.thisUserNickname)
      self.updated()
      this.$http.post(self.host + 'insertchat', qs.stringify({
        id: self.chatId,
        content: newChatData
      }))
        .then(function (response) {
          if (response.data.code === 0) {
            self.selectChat()
          } else if (response.data.code === 1) {
            self.$message.error(response.data.msg)
          } else if (response.data.code === 2) {
            self.$message.error('尚未登录，请登陆后操作')
            setTimeout(function () {
              self.$router.push('/login')
            }, 1500)
          }
        })
        .catch(function () {
          self.$message.error('网络错误或主机错误')
        })
      self.sendMessageButtonLoading = false
    },
    changeStatus: function (id, popoutOrNot) {
      let self = this
      this.changeStatusPopoutLoading = true
      this.$http({
        url: self.host + 'insertspeed',
        method: 'post',
        data: qs.stringify({
          id: id
        })
      })
        .then(function (response) {
          if (response.data.code === 0) {
            self.$message({
              message: '更改状态成功',
              type: 'success'
            })
            setTimeout(function () {
              popoutOrNot.confirmShowOrNot = false
              self.changeStatusPopoutLoading = false
              self.selectRepair()
            }, 1500)
          } else if (response.data.code === 1) {
            self.$message({
              message: response.data.msg,
              type: 'error'
            })
            self.changeStatusPopoutLoading = false
          } else if (response.data.code === 2) {
            self.$message({
              message: '您尚未登陆，请登录后操作',
              type: 'error'
            })
            setTimeout(function () {
              self.$router.push('/login')
            }, 2000)
          }
        })
        .catch(function () {
          self.$message({
            message: '网络错误或主机错误，请联系管理员',
            type: 'error'
          })
          self.changeStatusPopoutLoading = false
        })
    },
    selectARepair: function (id) {
      let self = this
      this.pageLoading = true
      this.$http.get(self.host + 'selectrepair/id/' + id)
        .then(function (response) {
          if (response.data.code === 0) {
            let data = response.data.data[0]
            let time = self.handleTime(data['time'])
            let speed = response.data.speed
            self.selectARepairDialogVisible = true
            self.selectARepairDetail.address = data['address']
            self.selectARepairDetail.content = data['content']
            self.selectARepairDetail.id = data['id']
            self.selectARepairDetail.tel = data['tel']
            self.selectARepairDetail.img = data['img']
            self.selectARepairDetail.openid = '用户' + data['openid']
            self.selectARepairDetail.time = time
            self.selectARepairDetail.status = response.data.status
            self.selectARepairDetail.speed.admin0 = speed.admin0
            self.selectARepairDetail.speed.time0 = speed.time0
            self.selectARepairDetail.speed.admin1 = speed.admin1
            self.selectARepairDetail.speed.time1 = speed.time1
            self.selectARepairDetail.speed.admin2 = speed.admin2
            self.selectARepairDetail.speed.time2 = speed.time2
            self.selectARepairDetail.speed.admin3 = speed.admin3
            self.selectARepairDetail.speed.time3 = speed.time3
            self.selectARepairDetail.evaluation = data.evaluation
          } else if (response.data.code === 1) {
            self.$message.error(response.data.msg)
          } else if (response.data.code === 2) {
            self.$message.error('您尚未登录，请登陆后操作')
            setTimeout(function () {
              self.$router.push('/login')
            }, 1500)
          }
          self.pageLoading = false
        })
        .catch(function () {
          self.$message.error('网络错误或主机错误')
          self.pageLoading = false
        })
    },
    updated: function () {
      this.$nextTick(function () {
        let div = document.getElementById('chatBody')
        div.scrollTop = div.scrollHeight
      })
    },
    selectAdminList: function () {
      let self = this
      this.pageLoading = true
      this.$http.get(self.host + 'selectadmin')
        .then(function (response) {
          self.pageLoading = false
          if (response.data.code === 0) {
            self.adminListShow = true
            self.adminList.splice(0)
            let data = response.data.data
            for (let i in data) {
              let layers = data[i]['layer']
              if (layers === 1) {
                layers = '普通管理员'
              } else {
                layers = '超级管理员'
              }
              let tmp = {
                id: data[i]['id'],
                nickname: data[i]['admin_name'],
                openid: data[i]['openid'],
                layer: layers,
                confirmShowOrNot: false
              }
              self.adminList.push(tmp)
            }
          } else if (response.data.code === 1) {
            self.$message.error(response.data.msg)
          } else if (response.data.code === 2) {
            self.$message.error('尚未登录，请登陆后操作')
            setTimeout(function () {
              self.$router.push('/login')
            }, 1500)
          }
        })
        .catch(function () {
          self.pageLoading = false
          self.$message.error('网络错误或主机错误')
        })
    },
    editAdmin: function (obj) {
      this.editAdminDetailShow = true
      console.log(obj)
      this.adminDetail = {
        id: obj.id,
        openid: obj.openid,
        layer: obj.layer,
        password: '',
        nickname: obj.nickname
      }
    },
    updateAdmin: function () {
      let self = this
      if (this.adminDetail.id === '' || this.adminDetail.nickname === '' || this.adminDetail.layer === '') {
        this.$message.error('表单信息不能为空，请检查')
      } else {
        this.editAdminLoading = true
        let layer = this.adminDetail.layer
        if (layer === '普通管理员') {
          layer = 1
        } else if (layer === '超级管理员') {
          layer = 2
        }
        this.$http.post(self.host + 'updateadmin', qs.stringify({
          adminName: this.adminDetail.nickname,
          password: this.adminDetail.password,
          id: this.adminDetail.id,
          layer: layer
        }))
          .then(function (response) {
            self.editAdminLoading = false
            if (response.data.code === 0) {
              self.$message({
                message: '更改成功！',
                type: 'success'
              })
              self.editAdminDetailShow = false
              self.selectAdminList()
            } else if (response.data.code === 1) {
              self.$message({
                message: response.data.msg,
                type: 'error'
              })
              self.addAdminLoading = false
              self.selectAdminList()
            } else if (response.data.code === 2) {
              self.$message({
                message: '您尚未登陆，请登录后操作',
                type: 'error'
              })
              setTimeout(function () {
                self.$router.push('/login')
              }, 2000)
            }
          })
          .catch(function (e) {
            self.editAdminLoading = false
            self.$message.error('出错了，请重试')
          })
      }
    },
    deleteAdmin: function (id, obj) {
      let self = this
      this.deleteAdminLoading = true
      this.$http.post(self.host + 'deleteadmin', qs.stringify({
        id: id
      }))
        .then(function (response) {
          self.deleteAdminLoading = false
          if (response.data.code === 0) {
            self.$message({
              message: '删除成功！',
              type: 'success'
            })
            obj.row.confirmShowOrNot = false
            self.selectAdminList()
          } else if (response.data.code === 1) {
            self.$message({
              message: response.data.msg,
              type: 'error'
            })
          } else if (response.data.code === 2) {
            self.$message({
              message: '您尚未登陆，请登录后操作',
              type: 'error'
            })
            setTimeout(function () {
              self.$router.push('/login')
            }, 2000)
          }
        })
        .catch(function (e) {
          self.deleteAdminLoading = false
          self.$message.error('出错了，请重试')
        })
    }
  },
  watch: {
    chatDialogShow: function () {
      if (this.chatDialogShow === true) {
        this.selectRepair()
      }
    }
  },
  mounted: function () {
    this.selectRepair()
    let self = this
    setInterval(function () {
      if (self.chatDialogShow) {
        self.selectChat()
      }
    }, 10000)
    setInterval(function () {
      self.selectRepair()
    }, 600000)
  },
  computed: {
    selectARepairDetailStatus1: function () {
      return '本工单已由' + this.selectARepairDetail.speed.admin0 + '在' + this.handleTime(this.selectARepairDetail.speed.time0) + '提交'
    },
    selectARepairDetailStatus2: function () {
      if (this.selectARepairDetail.speed.admin1) {
        return '本工单已由管理员' + this.selectARepairDetail.speed.admin1 + '在' + this.handleTime(this.selectARepairDetail.speed.time1) + '更改为正在维修'
      }
      return ''
    },
    selectARepairDetailStatus3: function () {
      if (this.selectARepairDetail.speed.admin2) {
        return '本工单已由管理员' + this.selectARepairDetail.speed.admin2 + '在' + this.handleTime(this.selectARepairDetail.speed.time2) + '更改为已维修'
      }
      return ''
    }
  }
}
</script>

<style scoped>
#page {
  margin: 0;
  padding: 0;
}
.right {
  float: right;
  vertical-align: center;
  line-height: 3rem;
  position: relative;
  bottom: 0.5rem;
  color: #fff;
}
#repair-information {
  text-align: center;
  width: 74rem;
  margin: 2rem auto 0 auto;
}
#chatBody {
  margin-bottom: 0.5rem;
  background: #eee;
  border-radius: 0.5rem;
  overflow-y: auto;
  height: 26rem;
}
.el-table {
  margin: 0 auto;
}
.el-form-item {
  margin-top: 0;
  margin-bottom: 0.5rem;
}
.repair-form-button {
  margin-right: 0.1rem;
}
header {
  background: #3498e9;
  letter-spacing: 0.3rem;
  color: #fff;
  padding: 1rem 0;
  font-size: 1.2rem;
  margin-bottom: 0.2rem;
  moz-user-select: -moz-none;
  -moz-user-select: none;
  -o-user-select:none;
  -khtml-user-select:none;
  -webkit-user-select:none;
  -ms-user-select:none;
  user-select:none;
}
.header-img {
  height: 2rem;
  margin: 0.3rem 2rem;
  cursor: pointer;
}
  #nav {
    /*background: #0469b7;*/
    margin-top: 1rem;
    height: 2.5rem;
    border-top: 1px solid #fff  ;
  }
  .nav-menu {
    height: 1.9rem;
    margin: 0 0.5rem;
    margin-top: 0.5rem;
    line-height: 1.9rem;
    padding: 0 0.3rem;
    float: left;
    moz-user-select: -moz-none;
    -moz-user-select: none;
    -o-user-select:none;
    -khtml-user-select:none;
    -webkit-user-select:none;
    -ms-user-select:none;
    user-select:none;
  }
  .el-tag:hover {
    background: #409EFF;
    color: #fff;
    cursor: pointer;
  }
  .el-footer{
    text-align: center;
  }
  .message-input {
    width: 54rem;
    margin-right: 2rem;
  }
  #send {
    margin-top: 0.5rem;
  }
  #footer {
    margin-top: 3rem;
    color: #909399;
    bottom: 0;
    line-height: 1.5rem;
  }
  a {
    text-decoration: none;
    color: #606266;
  }
  .messages {
    margin-top: 0.5rem;
  }
  .message-user-left {
    float: left;
    margin: 0.2rem 0 0.2rem 1rem;
  }
  .message-left {
    float: left;
  }
  .message-user-right {
    float: right;
    margin: 0.2rem 1rem 0.2rem 0;
  }
  .message-right {
    float: right;
  }
  .message-content {
    border-radius: 0.2rem;
    background: #9eea6a;
    padding: 0.5rem;
  }
  .message-body{
    margin: 0.3rem auto;
    width: 51rem;
  }
  .message-nickname {
    color: #b8b8b8;
  }
</style>
