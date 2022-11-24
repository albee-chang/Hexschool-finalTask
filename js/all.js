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
    str += combineHTMLStr(item);
    productList.innerHTML = str;
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

//提交表單
const submitBtn = document.querySelector(".orderInfo-btn");
//驗證表單套間格式
const constraints = {
  姓名: {
    presence: {
      allowEmpty: false,
      message: "必填！",
    },
  },
  電話: {
    presence: {
      allowEmpty: false,
      message: "必填！",
    },
  },
  Email: {
    presence: {
      allowEmpty: false,
      message: "必填！",
    },
  },
  寄送地址: {
    presence: {
      allowEmpty: false,
      message: "必填！",
    },
  },
};
const submitForm = document.querySelector(".orderInfo-form");
const orderInfoBtn = document.querySelector(".orderInfo-btn");
submitBtn.addEventListener("click", function (e) {
  e.preventDefault();
  const errors = validate(submitForm, constraints);
  if (errors) {
    const keys = Object.keys(errors);
    const values = Object.values(errors);
    keys.forEach((item, index) => {
      document.querySelector(`[data-message="${item}"]`).textContent =
        values[index];
    });
  }

  if (cartData.length == 0) {
    alert("購物車內沒有商品");
    return;
  }

  const customerName = document.querySelector("#customerName").value;
  const customerPhone = document.querySelector("#customerPhone").value;
  const customerEmail = document.querySelector("#customerEmail").value;
  const customerAddress = document.querySelector("#customerAddress").value;
  const tradeWay = document.querySelector("#tradeWay").value;
  if (
    customerName == "" ||
    customerPhone == "" ||
    customerEmail == "" ||
    customerAddress == "" ||
    tradeWay == ""
  ) {
    alert("請輸入訂單資訊");
    return;
  }
  //產生訂單
  axios
    .post(`${api_url}/customer/${api_path}/orders`, {
      data: {
        user: {
          name: customerName,
          tel: customerPhone,
          email: customerPhone,
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
    });
});

//util js(價格加上逗號)
function toThousands(x) {
  let parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}
