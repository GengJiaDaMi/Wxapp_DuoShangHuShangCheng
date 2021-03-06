class Storage {
    constructor() {}

    //操作购物车 event:事件函数；data:商品详情；that:函数page
    operateCar(data, that) {
        var carInfo = wx.getStorageSync('pdtincar'); //获取购物车数据

        if (carInfo) {
            this._addPdtTocar(carInfo, data, that)

        } else {
            //购物车无商品 addToCart添加商品
            this._addPdtIncar(data, that)
        }
        wx.showToast({
            title: '加入购物车成功',
            duration: 2000
        })
    }

    //无商品时添加商品到购物车
    _addPdtIncar(data, that) {
        var goodsIncar = {
            account: 1,
            commodities: []
        };
        data.count = 1;
        data.selected = true;
        goodsIncar.commodities[0] = {
            shopid: data.shop_id,
            shopName: data.shopname,
            account: 1,
            deliveryPrice: data.deliveryPrice,
            totalPrice: data.price,
            totalfav: (data.price_orig * 1 - data.price * 1).toFixed(2),
            selected: true, //店铺全选
            //商品详情 array
            commodity: [
                data
            ]
        }
        wx.setStorageSync('pdtincar', goodsIncar);
        that.setData({
            pageCar: goodsIncar
        })
    }

    //有商品时添加商品到购物车
    _addPdtTocar(carInfo, data, that) {
        carInfo.account = carInfo.account * 1 + 1;
        var arr = carInfo.commodities;
        var s = false;
        if (!arr) {
            arr = [];
        }
        arr.forEach(function(item, index) {
            if (item && item.shopid == data.shop_id) {
                item.account = item.account * 1 + 1;
                item.shopName = data.shopname;
                item.totalPrice = (item.totalPrice * 1 + data.price * 1).toFixed(2);
                item.totalfav = (item.totalfav * 1 + data.price_orig * 1 - data.price * 1).toFixed(2);
                var arr1 = item.commodity;
                var s1 = false;
                let s2 = false;
                arr1.forEach(function(item1, index1) {
                    if (item1.id == data.id) {
                        item1.count = item1.count * 1 + 1;
                        s1 = true;
                    }
                    if (item1.selected) {
                        s2 = true
                    }
                })
                if (!s1) {
                    data.count = 1;
                    data.selected = s2;
                    arr1.push(data);
                }
                arr.commodity = arr1;
                carInfo.commodities = arr;
                s = true
            }
        })
        if (!s) {
            let s2 = true
            for (let i of arr) {
                for (let j of i.commodity) {
                    if (j.selected) {
                        s2 = false
                    }
                }
            }

            data.count = 1;
            data.selected = s2;
            var newUnit = {
                shopid: data.shop_id,
                shopName: data.shopname,
                account: 1,
                totalPrice: data.price,
                deliveryPrice: data.deliveryPrice,
                totalfav: (data.price_orig * 1 - data.price * 1).toFixed(2),
                selected: s2,
                commodity: [
                    data
                ]
            }
            arr.push(newUnit)
            carInfo.commodities = arr;
        }
        wx.setStorageSync('pdtincar', carInfo);
        that.setData({
            pageCar: carInfo
        })
    }

    //下单后清除已下单的商品
    _clearPdtPay(clearCart, acconutde) {
        var pdtincar = wx.getStorageSync('pdtincar');
        pdtincar.account = pdtincar.account - acconutde;
        if (pdtincar.account == 0) {
            pdtincar = null;
        } else {
            (pdtincar.commodities).forEach(function(item, index) {
                for (let i of clearCart) {
                    if (item.shopid == i.shop_id) {
                        pdtincar.commodities[index].account = pdtincar.commodities[index].account - i.count;
                        if (pdtincar.commodities[index].account == 0) {
                            delete pdtincar.commodities[index];
                        } else {
                            pdtincar.commodities[index].totalPrice = pdtincar.commodities[index].totalPrice - i.totalPrice;
                            pdtincar.commodities[index].totalfav = pdtincar.commodities[index].totalfav - i.totalfav;
                            (pdtincar.commodities[index].commodity).forEach(function(item1, index1) {
                                clearCart.forEach(function(items, indexs) {
                                    if (item1.id == items.id) {
                                        pdtincar.commodities[index].commodity[index1].count -= clearCart[indexs].count
                                        if (pdtincar.commodities[index].commodity[index1].count == 0) {
                                            delete pdtincar.commodities[index].commodity[index1]
                                        }
                                    }
                                })
                            })
                        }
                    }
                }
            })
        }
        wx.setStorageSync('pdtincar', pdtincar);
        this._reVoluationCart()
    }

    //删除购物车内null的数据
    _reVoluationCart() {
        var pdt = wx.getStorageSync('pdtincar')
        var newcommodities = []
        if (!pdt) {
            wx.setStorageSync('pdtincar', null)
        } else {
            if (pdt.account < 1) {
                wx.setStorageSync('pdtincar', null)
            } else {
                var commodities = pdt.commodities
                commodities.forEach(function(item, index) {
                    if (item) {
                        newcommodities = newcommodities.concat(item)
                    }
                })
                newcommodities.forEach(function(item, index) {
                    var newcommodity = []
                    item.commodity.forEach(function(items, indexs) {
                        if (items) {
                            newcommodity = newcommodity.concat(items)
                        }
                    })
                    newcommodities[index].commodity = newcommodity
                })
                var newpdt = {
                    account: pdt.account,
                    commodities: newcommodities
                }
                wx.setStorageSync('pdtincar', null);
                wx.setStorageSync('pdtincar', newpdt);
            }
        }
    }

    //取得购车车内所有商品id
    _getAllGoodidIncart(callback) {
        var pdt = wx.getStorageSync('pdtincar')
        var ids = ''
        if (pdt) {
            var commodities = pdt.commodities
            commodities.forEach(function(item, index) {
                var commodity = item.commodity
                commodity.forEach(function(item, index) {
                    if (ids.length == 0) {
                        ids = item.id
                    } else {
                        ids = ids + ',' + item.id
                    }
                })
            })
        }
        callback && callback(ids)
    }

    //取得点击支付时所有订单商品的id
    _getAllGoodidTopay(callback) {
        var makeorder = wx.getStorageSync('makeorder')
        var ids = []
        if (makeorder) {
            var commodity = makeorder.commodity
            commodity.forEach(function(item, index) {
                if (ids.length == 0) {
                    ids = item.id
                } else {
                    ids = ids + ',' + item.id

                }
            })
        }
        callback && callback(ids)
    }

    //获取订单详情的购物车数据
    _getGoodInCart(id, callback) {
        var pdt = wx.getStorageSync('pdtincar');
        var good = null
        if (pdt) {
            var commodities = pdt.commodities
            commodities.forEach(function(item, index) {
                item.commodity.forEach(function(item, index) {
                    if (item.id == id) {
                        good = item
                    }
                })
            })
        }
        callback && callback(good)
    }

}

export default Storage