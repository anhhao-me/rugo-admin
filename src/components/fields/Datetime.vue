<template>
  <div class="d-flex">
    <b-form-datepicker
      class="mr-1"
      v-model="date"
      @input="update"
    />
    <b-form-timepicker 
      show-seconds
      :hour12="false"
      class="ml-1" v-model="time"
      @input="update"
    />
  </div>
</template>

<script>
import moment from 'moment';

export default {
  props: ['value'],
  data(){
    return {
      date: null,
      time: null
    }
  },
  computed: {
    formatedValue(){
      return moment(this.value).format('YYYY-MM-DD HH:mm:ss');
    }
  },
  methods: {
    update(){
      const d = moment(`${this.date} ${this.time}`, 'YYYY-MM-DD HH:mm:ss').toDate();
      this.$emit('input', d);
    },
    breakValue(value){
      if (!this.value){
        return { date: null, time: null };
      }

      const d = moment(value);
      const date = d.format('YYYY-MM-DD');
      const time = d.format('HH:mm:ss');

      return { date, time };
    }
  },
  mounted(){
    const { date, time } = this.breakValue(this.value);
    if (this.date !== date)
      this.date = date;
    if (this.time !== time)
      this.time = time;
  },
  watch: {
    value(){
      const { date, time } = this.breakValue(this.value);
      if (this.date !== date)
        this.date = date;
      if (this.time !== time)
        this.time = time;
    }
  }
}
</script>

<style>

</style>