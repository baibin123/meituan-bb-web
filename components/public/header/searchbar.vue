<template>
  <div class="search-panel">
    <el-row class="m-header-searchbar" >
      <el-col class="left" :span="3">
        <img
          src="//s0.meituan.net/bs/fe-web-meituan/e5eeaef/img/logo.png"
          alt="美团">
      </el-col>
      <el-col class="center" :span="15">
        <div class="wrapper">
          <el-input
            v-model="search"
            @blur="blur"
            @focus="focus"
            @input="input"
            placeholder="请输入商家或地点" />
          <button class="el-button el-button--primary">
            <i class="el-icon-search"/>
          </button>
          <dl class="hotPlace" v-if="isHotPlace">
            <dt>热门搜索</dt>
            <dd v-for="(item,idx) in hotPlace" :key="idx">{{ item }}</dd>
          </dl>
          <dl class="searchList" v-if="isSearchList">
            <dd v-for="(item,idx) in searchList" :key="idx">{{ item }}</dd>
          </dl>
        </div>
        <p class="suggest">
          <a href="">故宫博物院</a>
          <a href="">故宫博物院</a>
          <a href="">故宫博物院</a>
          <a href="">故宫博物院</a>
          <a href="">故宫博物院</a>
        </p>
        <ul class="nav">
          <li>
            <nuxt-link class="takeout" to="/">美团外卖</nuxt-link>
          </li>
          <li>
            <nuxt-link class="movie" to="/">猫眼电影</nuxt-link>
          </li>
          <li>
            <nuxt-link class="hotel" to="/">美团酒店</nuxt-link>
          </li>
          <li>
            <nuxt-link class="department" to="/">民宿/公寓</nuxt-link>
          </li>
          <li>
            <nuxt-link class="business" to="/">商家入驻</nuxt-link>
          </li>
        </ul>
      </el-col>
      <el-col class="right" :span="6">
        <ul class="security">
          <li><i class="refund"/><p class="txt">随时退</p></li>
          <li><i class="single"/><p class="txt">不满意免单</p></li>
          <li><i class="overdue"/><p class="txt">过期退</p></li>
        </ul>
      </el-col>
    </el-row>
  </div>

</template>
<script>
  export default {
    data: function () {
      return {
        isFocus: false,
        search: null,
        hotPlace: ['火锅','火锅','火锅','火锅','火锅'],
        searchList: ['火锅','火锅','火锅','火锅','火锅'],
      }
    },
    computed: {
      isHotPlace: function () {
        return this.isFocus && !this.search
      },
      isSearchList: function () {
        return this.isFocus && this.search
      }
    },
    methods: {
      blur: function () {
        const self = this;
        setTimeout(()=>{
            self.isFocus = false;
        }, 200)
      },
      focus: function () {
        this.isFocus = true;
      },
      input: function () {
        console.log(this.search);
      }
    }
  }
</script>
<style lang="css">

</style>
