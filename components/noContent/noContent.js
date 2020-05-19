// components/noContent/noContent.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    types: String,  //  cart(购物车) list(订单列表)
    title: String,
    subTitle: String,
    btn: String,
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    goindex:function(){
      wx.switchTab({
        url: '/pages/index/index',
      })
    }
  }
})
