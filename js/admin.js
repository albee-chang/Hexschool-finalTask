const adminOrderList = document.querySelector(".adminOrderList");

let orderData = [];
function init() {
  getOrderList();
}
init();

//取得訂單列表
function getOrderList() {
  axios
    .get(`${api_url}/admin/${api_path}/orders`, {
      headers: {
        authorization: token,
      },
    })
    .then(function (response) {
      orderData = response.data.orders;
      let str = "";
      //組產品字串
      orderData.forEach((e) => {
        let productStr = "";
        //組時間字串
        const timeStamp = new Date(e.createdAt * 1000);
        const orderTime = `${timeStamp.getFullYear()}/${
          timeStamp.getMonth() + 1
        }/${timeStamp.getDate()}`;
        e.products.forEach(function (productItem) {
          productStr += `<p>${productItem.title} x ${productItem.quantity}</p>`;
        });
        //判斷訂單處理狀態
        let orderStatus = "";
        if (e.paid == true) {
          orderStatus = "已處理";
        } else {
          orderStatus = "未處理";
        }
        //組訂單字串
        str += ` <tr>
      <td>${e.id}</td>
      <td>
        <p>${e.user.name}</p>
        <p>${e.user.tel}</p>
      </td>
      <td>${e.user.address}</td>
      <td>${e.user.email}</td>
      <td>
        ${productStr}
      </td>
      <td>${orderTime}</td>
      <td class="orderStatus">
        <a href="#" data-status="${e.paid}" data-id=${e.id} class="admin-orderStatus"> ${orderStatus} </a>
      </td>
      <td>
        <input type="button" class="delSingleOrder-Btn" data-id=${e.id} value="刪除" />
      </td>
      </tr>`;
      });
      adminOrderList.innerHTML = str;
      renderC3();
    })
    .catch(function (error) {
      console.log(error);
    });
}
//點擊 修改訂單狀態以及單筆刪除按鈕 監聽
adminOrderList.addEventListener("click", function (e) {
  e.preventDefault();
  const targetClass = e.target.getAttribute("class");
  let id = e.target.getAttribute("data-id");
  if (targetClass == "delSingleOrder-Btn") {
    alert("刪除成功");
    deleteOrderItem(id);
    return;
  }
  if (targetClass == "admin-orderStatus") {
    let status = e.target.getAttribute("data-status");
    changsStatus(status, id);
    return;
  }
});
//修改訂單狀態
function changsStatus(status, id) {
  let newStatus;
  if (status == true) {
    newStatus = false;
  } else {
    newStatus = true;
  }
  axios
    .put(
      `${api_url}/admin/${api_path}/orders`,
      {
        data: {
          id: `${id}`,
          paid: true,
        },
      },
      {
        headers: {
          authorization: token,
        },
      }
    )
    .then(function (response) {
      alert("修改狀態成功");
      getOrderList();
      return;
    });
}
//刪除訂單單筆資料
function deleteOrderItem(id) {
  axios
    .delete(`${api_url}/admin/${api_path}/orders/${id}`, {
      headers: {
        authorization: token,
      },
    })
    .then(function (response) {
      alert("刪除該筆訂單成功");
      getOrderList();
    });
}
//刪除全部訂單
const discardAllBtn = document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click", (e) => {
  deleteOrder();
});
function deleteOrder() {
  axios
    .delete(`${api_url}/admin/${api_path}/orders`, {
      headers: {
        authorization: token,
      },
    })
    .then(function (response) {
      alert("已刪除全部訂單");
      getOrderList();
    });
}
function renderC3() {
  //物件資料收集
  let total = {};
  orderData.forEach((item) => {
    item.products.forEach((productItem) => {
      if (total[productItem.title] == undefined) {
        total[productItem.title] = productItem.price * productItem.quantity;
      } else {
        total[productItem.title] += productItem.price * productItem.quantity;
      }
    });
  });
  console.log(total);
  //組出C3格式資料
  let categoryAry = Object.keys(total);
  let newData = [];
  categoryAry.forEach(function (item) {
    let ary = [];
    ary.push(item);
    ary.push(total[item]);
    newData.push(ary);
  });
  //把資料依照金額大小排序
  newData.sort(function (a, b) {
    return b[1] - a[1];
  });
  //筆數如果超過四筆，就統整為其他
  if (newData.length > 3) {
    let otherTotal = 0;
    newData.forEach((item, index) => {
      if (index > 2) {
        otherTotal += newData[index][1];
      }
    });
    newData.splice(3, newData.length - 1);
    newData.push(["其他", otherTotal]);
  }
  // C3.js
  let chart = c3.generate({
    bindto: "#chart", // HTML 元素綁定
    data: {
      type: "pie",
      columns: newData,
    },
    color: {
      pattern: ["#301E5F", "#5434A7", "#9D7FEA", "#DACBFF"],
    },
  });
}
