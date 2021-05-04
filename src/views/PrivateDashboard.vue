<template>
  <b-row>
    <b-col cols="12" lg="8">
      <div class="modelList">
        <b-row class="px-2">
          <b-col 
            v-for="model in models"
            :key="model.name" 
            class="px-2 pb-3" 
            cols="6" 
            md="4" 
            xl="3"
          >
            <router-link  :to="`/private/models/${model.name}`" class="item rounded w-100 h-100 p-3 d-block">
              <div class="icon"><i :class="`icon-${ model.icon || 'doc'}`"></i></div>
              <div class="label">{{ model.label || model.name }}</div>
              <div class="capacity">{{ byteText(getTotalSize(model)) }}</div>
            </router-link>
          </b-col>
        </b-row>
      </div>
    </b-col>
    <!-- <b-col cols="12" lg="4">
      <div class="utils bg-white rounded mb-3 pt-3 pl-3 pr-3 pb-2">
        <b-button class="d-block mb-2 w-100 text-left text-white" size="sm" variant="primary" v-for="item in utils" :key="item.label">
          {{ item.label }}
        </b-button>
      </div>
    </b-col> -->
  </b-row>
</template>

<script>
import bytes from 'bytes';
import { mapMutations, mapState } from 'vuex'

export default {
  computed: {
    ...mapState(['models', 'utils'])
  },
  methods: {
    ...mapMutations(['setTitle']),
    getTotalSize(model){
      if (!model.stats)
        return 0;

      if (model.type === 'mongodb' && model.stats.storageSize && model.stats.totalIndexSize)
        return model.stats.storageSize + model.stats.totalIndexSize;

      if (model.type === 'filesystem')
        return model.stats.totalSize;

      return 0;
    },

    byteText(size){
      return bytes(size);
    }
  },
  mounted(){
    this.setTitle('Bảng điều khiển');
  }
}
</script>

<style lang="scss" scoped>
.modelList {
  .item {
    text-align: center;
    display: block;
    transition: all .3s;
    background-color: white;
    box-shadow: 0 0.1em 0.1em rgba(0, 0, 0, .2);

    .icon {
      font-size: 2em;
      margin-bottom: .2em;
    }

    .label {
      font-weight: bold;
    }

    .capacity {
      margin-top: .2em;
      font-size: .75em;
      font-weight: lighter;
    }

    &:hover {
      text-decoration: none;
      box-shadow: 0 0.2em 0.3em rgba(0, 0, 0, .2);
      transform: translate(0, -.2em);
    }
  }
}
</style>