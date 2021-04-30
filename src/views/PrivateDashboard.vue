<template>
  <b-container class="py-3">
    <div class="bg-white rounded p-3 mb-3">
      <h3>Bảng điều khiển</h3>
    </div>
    <div class="modelList">
      <b-row class="px-2">
        <b-col 
          v-for="model in models"
          :key="model.name" 
          class="px-2 pb-3" 
          cols="6" 
          md="4" 
          lg="3"
        >
          <router-link  :to="`/private/models/${model.name}`" class="item rounded w-100 h-100 p-3 d-block">
            <div class="icon"><i :class="`icon-${ model.icon || 'doc'}`"></i></div>
            <div class="label">{{ model.label || model.name }}</div>
          </router-link>
        </b-col>
      </b-row>
    </div>
    <!-- <div class="bg-white rounded p-3 mb-3">
      {{ agent }}
    </div> -->
  </b-container>
</template>

<script>
import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState(['models'])
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

    &:hover {
      text-decoration: none;
      box-shadow: 0 0.2em 0.3em rgba(0, 0, 0, .2);
      transform: translate(0, -.2em);
    }
  }
}
</style>