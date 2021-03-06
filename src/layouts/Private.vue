<template>
  <div class="PrivateLayout">
    <input type="checkbox" id="openSideBar" v-model="isOpenSideBar">
    <label for="openSideBar" class="btn openSideBarLabel">
      <i class="icon-menu"></i>
    </label>
    <label for="openSideBar" class="openSideBarBg"></label>
    <div class="topBar"></div>
    <div class="sideBar">
      <div class="sideBarHeader p-4">
        <img src="@/assets/images/logo-text.png" alt="" class="w-100">
      </div>
      <!-- dashboard -->
      <router-link class="item d-flex" to="/private/dashboard">
        <div class="icon"><i class="icon-grid"></i></div>
        <div class="label">Bảng điều khiển</div>
      </router-link>
      <!-- end dashboard -->

      <!-- model link -->
      <hr v-if="models && models.length !== 0">
      <router-link class="item d-flex" :to="`/private/models/${model.name}`" v-for="model in models" :key="`schema-${model.name}`">
        <div class="icon"><i :class="`icon-${ model.icon || 'doc'}`"></i></div>
        <div class="label">{{ model.label || model.name }}</div>
      </router-link>
      <!-- end model link -->

      <hr>
      <a class="item d-flex" @click="doLogout"> 
        <div class="icon"><i :class="`icon-logout`"></i></div>
        <div class="label">Đăng xuất</div>
      </a>
    </div>
    <div class="mainView">
      <div class="viewHeader" v-if="title">
        <b-container>
          <h4>{{ title }}</h4>
        </b-container>
      </div>
      <b-container class="py-3">
        <router-view/>
      </b-container>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex'

export default {
  data(){
    return {
      isOpenSideBar: false
    }
  },
  computed: {
    ...mapState(['models', 'token', 'title']),
  },
  methods: {
    ...mapMutations(['setModels', 'setToken', 'setUtils', 'setTitle']),
    ...mapMutations('notice', {
      pushNotice: 'push'
    }),
    async doLogout(){
      this.setToken(null);
      this.$router.push('/login')
    },

    async syncInfo(){
      const res = await this.$api.httpGet('/');

      if (!res || !res.models){
        this.$router.push('/login');
        return;
      }

      this.setModels(res.models.map(model => {
        const schema = {};
        for (let name in model.schema){
          if (name.indexOf('__') !== 0 && typeof model.schema[name] === 'string'){
            schema[name] = {
              type: model.schema[name]
            }
          } else {
            schema[name] = model.schema[name];
          }
        }

        return Object.assign({}, model, { schema });
      }));
      this.setUtils(res.utils);
    }
  },
  mounted(){
    if (!this.token){
      this.pushNotice({ text: 'You must login first', type: 'warning' });
      this.$router.push('/login');
    } else {
      this.syncInfo();
    }
  },
  watch: {
    token(){
      if (this.token)
        this.syncInfo();
    },
    $route(){
      this.isOpenSideBar = false;
      this.setTitle(null);
    }
  }
}
</script>

<style lang="scss" scoped>
.PrivateLayout {
  .topBar {
    height: 40px;
    width: 100%;
    background-color: #e0e0e0;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;
  }

  #openSideBar {
    display: none;
  }

  .openSideBarLabel {
    position: fixed;
    top: 0;
    left: 0;
    border-radius: 0;
    width: 40px;
    height: 40px;
    line-height: 40px;
    margin: 0;
    padding: 0;
    z-index: 1001;
    border-bottom: 1px solid #f0f0f0;
    background-color: #fff;
  }

  .openSideBarBg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, .2);
    cursor: pointer;
    display: none;
    z-index: 1002;
  }

  #openSideBar:checked~.openSideBarBg {
    display: block;
  }

  #openSideBar:checked~.sideBar {
    transform: translate(0, 0);
  }

  .sideBar {
    border-right: 1px solid #f0f0f0;
    background-color: white;
    max-width: 240px;
    height: 100vh;
    overflow: auto;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    transform: translate(-240px, 0);
    transition: all .3s;
    z-index: 1003;

    hr {
      margin: 0;
    }

    a.item:hover, a.item.active {
      text-decoration: none;
      background-color: #f5f5f5;
    }

    .item {
      line-height: 50px;
      cursor: pointer;

      .icon {
        width: 50px;
        text-align: center;
      }

      .label {
        text-transform: capitalize;
      }
    }
  }

  .mainView {
    background-color: #f0f0f0;
    min-height: 100vh;
    padding-top: 40px;

    .viewHeader {
      position: fixed;
      top: 0;
      left: 40px;
      z-index: 1001;
      height: 40px;
      width: calc(100% - 40px);
      padding: 0 25px 0 5px;
      background-color: white;
      text-align: center;
      border-bottom: 1px solid #f0f0f0;

      h4 {
        line-height: 40px;
        font-size: 14pt;
        text-transform: uppercase;
        margin-left: -20px;
        margin-right: -20px;
        margin-bottom: 0;
      }
    }
  }

  @media screen and (min-width: 960px) {
    .openSideBarLabel, .openSideBarBg, #openSideBar, .topBar {
      display: none !important;
    }

    .sideBar {
      transform: translate(0, 0);
    }

    .mainView {
      margin-left: 240px;
      padding-top: 0;

      .viewHeader {
        position: static;
        z-index: 1001;
        height: 60px;
        width: 100%;
        background-color: white;
        text-align: left;
        border-bottom: 1px solid #f0f0f0;

        h4 {
          line-height: 60px;
          font-size: 18pt;
          text-transform: none;
          margin: 0;
        }
      }
    }
  }
}
</style>