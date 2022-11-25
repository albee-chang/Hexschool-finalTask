// console.log(api_path, token);
const productList = document.querySelector(".productWrap");
const addCardBtn = document.querySelectorAll(".addCardBtn");
const shoppingCartItem = document.querySelector(".shoppingCartItem");
const productSelect = document.querySelector(".productSelect");
const cartTotalPrice = document.querySelector(".cartTotalPrice");
let data;
let cartData = [];
//資料初始化渲染
function renderProducts() {
  axios
    .get(`${api_url}/customer/${api_path}/products`)
    .then(function (response) {
      data = response.data.products;
      getProductList();
      getCartList();
    })
    .catch(function (error) {
      console.log(error);
    });
}
renderProducts();

//取得產品列表
function getProductList() {
  let str = ``;
  data.forEach((item) => {
    str += combineHTMLStr(item);
  });
  productList.innerHTML = str;
}

//產品篩選下拉選單功能
productSelect.addEventListener("change", function (e) {
  let str = "";
  const category = e.target.value;
  if (category == "全部") {
    getProductList();
  } else {
    data.forEach((item) => {
      if (item.category == category) {
        str += combineHTMLStr(item);
        productList.innerHTML = str;
      }
    });
  }
});
//消除重複
function combineHTMLStr(item) {
  return `<li class="productCard">
  <h4 class="productType">${item.category}</h4>
  <img
    src="${item.images}"
    alt=""
  />
  <a href="#" class="addCardBtn" dara-id="${item.id}">加入購物車</a>
  <h3>${item.title}</h3>
  <del class="originPrice">NT$${toThousands(item.origin_price)}</del>
  <p class="nowPrice">NT$${toThousands(item.price)}</p>
</li>`;
}

//加入購物車,監聽
productList.addEventListener("click", function (e) {
  e.preventDefault();
  let addCartClass = e.target.getAttribute("class");
  if (addCartClass !== "addCardBtn") {
    return;
  }
  //先找出產品的id
  let productId = e.target.getAttribute("dara-id");
  console.log(productId);
  //加入購物車邏輯
  let numberCheck = 1;
  cartData.forEach((item) => {
    if (item.product.id == productId) {
      numberCheck = item.quantity += 1;
    }
  });
  axios
    .post(`${api_url}/customer/${api_path}/carts`, {
      data: {
        productId: productId,
        quantity: numberCheck,
      },
    })
    .then(function (response) {
      getCartList();
    });
});

//取得購物車資訊
function getCartList() {
  axios
    .get(`${api_url}/customer/${api_path}/carts`)
    .then(function (response) {
      cartData = response.data.carts;
      let str = "";
      let total = 0;
      cartData.forEach((item) => {
        total += item.product.price * item.quantity;
        str += `<tr><td>
        <div class="cardItem-title">
          <img src="${item.product.images}" alt="" />
          <p>${item.product.title}</p>
        </div>
      </td>
      <td>NT$${toThousands(item.product.price)}</td>
      <td>${item.quantity}</td>
      <td>NT$${toThousands(item.product.price * item.quantity)}</td>
      <td class="discardBtn">
        <a href="#" class="material-icons" data-id="${item.id}"> clear </a>
      </td>
    </tr>`;
      });
      shoppingCartItem.innerHTML = str;
      cartTotalPrice.innerHTML = `NT$${toThousands(total)}`;
    })
    .catch(function (error) {
      console.log(error);
    });
}
//購物車列表刪除單一品項
shoppingCartItem.addEventListener("click", function (e) {
  e.preventDefault();
  const cartId = e.target.getAttribute("data-id");
  if (cartId == null) {
    return;
  }
  console.log(cartId);
  axios
    .delete(`${api_url}/customer/${api_path}/carts/${cartId}`)
    .then(function (response) {
      alert("刪除成功");
      getCartList();
    });
});

//刪除全部品項按鈕監聽
const discardAllBtn = document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click", function (e) {
  e.preventDefault();
  axios
    .delete(`${api_url}/customer/${api_path}/carts`)
    .then(function (response) {
      alert("刪除成功");
      getCartList();
    })
    .catch(function (error) {
      alert("購物車已清空!");
    });
});
// 進階 : validate.js 驗證
const constraints = {
  姓名: {
    presence: {
      message: "是必填欄位",
    },
  },
  電話: {
    presence: {
      message: "是必填欄位",
    },
    length: {
      minimum: 8,
      message: "號碼需超過 8 碼",
    },
  },
  Email: {
    presence: {
      message: "是必填欄位",
    },
    email: {
      message: "格式有誤",
    },
  },
  寄送地址: {
    presence: {
      message: "是必填欄位",
    },
  },
};
//提交表單
const submitForm = document.querySelector(".orderInfo-form");
const submitBtn = document.querySelector(".orderInfo-btn");
const message = document.querySelectorAll("[data-message]");
const inputs = document.querySelectorAll("input[type=text],input[type=tel],input[type=email]");
submitBtn.addEventListener('click',e =>{
  submitForm.addEventListener("submit",verification(e),false);
})


//util js(價格加上逗號)
function toThousands(x) {
  let parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}
function verification(e) {
  e.preventDefault();
  if (cartData.length == 0) {
    alert("購物車內沒有商品");
    return;
  }  
  let errors = validate(submitForm, constraints);
  // 如果有誤，呈現錯誤訊息
  if (errors) {
    message.forEach((item) => {
      console.log(errors);
      item.textContent = "";
      item.textContent = errors[item.dataset.message];
    });
  } else {
    // 如果沒有錯誤，送出表單
    addOrder();
  }
}
function addOrder() {
  const customerName = document.querySelector("#customerName").value;
  const customerPhone = document.querySelector("#customerPhone").value;
  const customerEmail = document.querySelector("#customerEmail").value;
  const customerAddress = document.querySelector("#customerAddress").value;
  const tradeWay = document.querySelector("#tradeWay").value;

  //產生訂單
  axios
    .post(`${api_url}/customer/${api_path}/orders`, {
      data: {
        user: {
          name: customerName,
          tel: customerPhone,
          email: customerEmail,
          address: customerAddress,
          payment: tradeWay,
        },
      },
    })
    .then(function (response) {
      alert("訂單建立成功");
      document.querySelector("#customerName").value = "";
      document.querySelector("#customerPhone").value = "";
      document.querySelector("#customerEmail").value = "";
      document.querySelector("#customerAddress").value = "";
      document.querySelector("#tradeWay").value = "ATM";
      getCartList();
    })
    .catch(function (error) {
      console.log(error);
    });
}
// 監控所有 input 的操作
inputs.forEach((item) => {
  item.addEventListener("change", function (e) {
    e.preventDefault();
    let key = item.name;
    let errors = validate(submitForm, constraints);
    item.nextElementSibling.textContent = "";
    // 針對正在操作的欄位呈現警告訊息
    if (errors) {
      document.querySelector(`[data-message='${key}']`).textContent =
        errors[key];
    }
  });
});