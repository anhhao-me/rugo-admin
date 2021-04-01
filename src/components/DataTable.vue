<template>
  <div class="DataTable" v-if="value">
    <b-form-checkbox-group v-model="selected" class="table-responsive" v-dragscroll>
      <table class="table mb-0">
        <!-- header -->
        <thead>
          <th>
            <b-button :variant="selected.length === 0 ? 'outline-primary' : 'primary'" class="m-0 p-0 d-block toggleCheck" @click="checkToggle" size="sm">
            </b-button>
          </th>
          <th v-for="(field, name) in schema" :key="name">
            {{ field.label || name }}
          </th>
          <th></th>
        </thead>
        <!-- end header -->

        <!-- main -->
        <tbody>
          <tr v-for="item in value" :key="item._id">
            <!-- select -->
            <td>
              <b-form-checkbox :value="item._id" class="mr-0"></b-form-checkbox>
            </td>
            <!-- end select -->

            <!-- content -->
            <td v-for="(field, name) in schema" :key="name">
              <component 
                v-bind:is="`${parseField(field).type}field`" 
                :value="item[name]"
              />
            </td>
            <!-- end content -->

            <!-- tool -->
            <td>
              <b-dropdown right no-caret variant="none" >
                <template #button-content>
                  <i class="icon-options-vertical"></i>
                </template>
                <b-dropdown-item-button @click="showInfo(item)">Thông tin</b-dropdown-item-button>
                <b-dropdown-item-button @click="$emit('edit', item)">Sửa</b-dropdown-item-button>
                <!-- <b-dropdown-item-button @click="$emit('remove', item)">Xóa</b-dropdown-item-button> -->
              </b-dropdown>
            </td>
            <!-- end tool -->
          </tr>
        </tbody>
        <!-- end main -->
      </table>
    </b-form-checkbox-group>

    <div class="info">
      <small class="d-inline-block mr-3">
        Số lượng: {{ value.length }}
      </small>
      <small class="d-inline-block mr-3" v-if="selected.length">
        Đã chọn: {{ selected.length }}
      </small>
    </div>

    <!-- INFO POPUP MODAL -->
    <b-modal id="infoPopup" title="Thông tin" hide-footer @hide="current = null">
      <div v-if="current">
        <b-row class="mb-2">
          <b-col><strong>ID</strong></b-col>
          <b-col>{{ current._id }}</b-col>
        </b-row>
        <b-row class="mb-2">
          <b-col><strong>Ngày tạo</strong></b-col>
          <b-col>{{ current.createdAt }}</b-col>
        </b-row>
        <b-row class="mb-2">
          <b-col><strong>Ngày sửa</strong></b-col>
          <b-col>{{ current.updatedAt }}</b-col>
        </b-row>
      </div>
    </b-modal>
    <!-- END INFO POPUP MODAL -->
  </div>
</template>

<script>
const FieldTypes = {};
const req = require.context('./views', true, /\.vue$/i)
req.keys()
.forEach(key => {
  const name = key.match(/\w+/)[0];
  FieldTypes[`${name}Field`.toLowerCase()] = req(key).default;
});

export default {
  props: ['value', 'schema'],
  components: {
    ...FieldTypes
  },
  data(){
    return {
      selected: [],
      current: null
    }
  },
  methods: {
    checkToggle(){
      if (!this.selected.length)
        this.selected = this.value.map(item => item._id);
      else
        this.selected = [];
    },
    showInfo(item){
      this.current = item;
      this.$bvModal.show('infoPopup');
    },
    parseField(fieldSchema){
      const validSchema = {};

      for (let key in fieldSchema){
        validSchema[key.toLowerCase()] = fieldSchema[key];
      }

      validSchema.type = (validSchema.type || '').toLowerCase();

      if (!FieldTypes[`${validSchema.type}field`]){
        validSchema.type = 'text';
      }

      const field = FieldTypes[`${validSchema.type}field`];

      if (field.validate && !field.validate(fieldSchema)){
        validSchema.type = 'text';
      }

      return Object.assign({}, validSchema)
    }
  },
  watch: {
    value: {
      deep: true,
      handler(){
        this.selected = [];
      }
    },
    selected: {
      deep: true,
      handler(){
        this.$emit('select', this.selected);
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.DataTable {
  .toggleCheck {
    line-height: 1;
    width: 16px;
    height: 16px;
    cursor: default;
  }

  table {
    td:first-child, td:last-child, th:first-child, th:last-child {
      width: 16px;
    }
  }
}
</style>