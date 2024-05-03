// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.4/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.8.4/firebase-analytics.js";
import {
  getDatabase,
  ref,
  get,
  child,
  update,
} from "https://www.gstatic.com/firebasejs/9.8.4/firebase-database.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBoHyhzOcmpUur1hnLlJxUXKluCWFvbQ4E",
  authDomain: "movie-ordering.firebaseapp.com",
  projectId: "movie-ordering",
  storageBucket: "movie-ordering.appspot.com",
  messagingSenderId: "239019124172",
  appId: "1:239019124172:web:e4f9ca62c84f0065682969",
  measurementId: "G-6LFDJGGW38",
  databaseURL: "https://movie-ordering-default-rtdb.firebaseio.com/",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);

var vm = new Vue({
  el: "#app",
  data: {
    isCartOpen: false,
    editing: false,
    movies: [],
    cart: [],
    currentMovie: null,
    selectVal: "",
  },
  // 取得電影資料
  created() {
    // let apiUrl = "movie.json";
    // axios.get(apiUrl).then((res) => {
    //   this.movies = res.data;
    // });
    get(child(ref(database), "/"))
      .then((snapshot) => {
        if (snapshot.exists()) {
          snapshot.val().forEach((element) => {
            this.movies.push(element);
          });
        } else {
          console.log("No data available");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  },
  methods: {
    bgCss(url) {
      return {
        "background-image": "url(" + url + ")",
        "background-position": "center center",
        "background-size": "cover",
      };
    },
    wheel(evt) {
      let leftVal = Number.parseInt($(".cards").css("left"));
      let min = -2380;
      let max = 0;
      leftVal += -evt.deltaY * 3;
      leftVal = leftVal < min ? min : leftVal;
      leftVal = leftVal > max ? max : leftVal;
      TweenMax.to(".cards", 0.8, {
        left: leftVal + "px",
      });
    },
    addCart(movie, evt) {
      if (movie.inventory < movie.tickets) {
        alert("票數超過庫存!請修改票數");
        movie.tickets = 1;
        return;
      }
      if (movie.tickets <= 0) {
        alert("票數至少要有一張!");
        movie.tickets = 1;
        return;
      }
      this.currentMovie = movie;
      movie.tickets = Math.floor(movie.tickets);
      let target = evt.target;
      this.$nextTick(() => {
        TweenMax.fromTo(
          ".buyBox",
          1,
          {
            opacity: 1,
            left: $(target).offset().left,
            top: $(target).offset().top,
          },
          {
            opacity: 0,
            left: $(".fixed-control").offset().left,
            top: $(".fixed-control").offset().top,
          }
        );
      });

      setTimeout(() => {
        let theMovie = this.cart.find((m) => m.name == movie.name);
        if (theMovie) {
          theMovie.tickets += movie.tickets;
        } else {
          let newMovie = JSON.parse(JSON.stringify(movie));
          this.cart.push(newMovie);
          this.cart.find((m) => m.name == movie.name).tickets = movie.tickets;
        }
      }, 700);
    },
    addTickets(movie) {
      let theMovie = this.cart.find((m) => m.name == movie.name);
      theMovie.tickets++;
    },
    delTickets(movie) {
      let theMovie = this.cart.find((m) => m.name == movie.name);
      theMovie.tickets--;
      if (theMovie.tickets <= 0) {
        this.delMovie(movie, theMovie);
      }
    },
    delMovie(movie, theMovieInCart) {
      if (confirm("確定要移除這個項目嗎?")) {
        const delIndex = this.cart.findIndex((m) => m.name == movie.name);
        this.cart.splice(delIndex, 1);
      } else {
        theMovieInCart.tickets++;
        console.log("no");
      }
    },
    clearCart() {
      if (confirm("確定要清空購物車中的所有項目嗎?")) {
        if (!this.cart.length) {
          alert("購物車已經是空的了");
          return;
        }
        this.cart = [];
      }
    },
    checkout() {
      let inventoryOut = false;
      this.cart.forEach((movie) => {
        inventoryOut = movie.inventory < movie.tickets;
      });
      if (inventoryOut) {
        alert("票數超過庫存!請修改票數");
        return;
      }
      let windowObjectReference;
      let windowFeatures = "left=100,top=100,width=480,height=320";

      windowObjectReference = window.open(
        `checkout.html?cartLength=${this.cart.length}&totalPrice=${this.totalPrice}`,
        "checkout",
        windowFeatures
      );
    },
    checkInventory(movie) {
      // if (this.movies.some((movie) => movie.inventory < 0)) {
      //   alert("庫存數不能低於0");
      //   this.movies.forEach((movie) => {
      //     movie.inventory = movie.inventory < 0 ? 1 : movie.inventory;
      //   });
      //   return;
      // }
      // this.movies.forEach((movie) => {
      //   movie.inventory = Math.floor(movie.inventory);
      // });
      if (movie.inventory < 0) {
        alert("庫存數不能低於0");
        let movieIndex = this.movies.findIndex((m) => m.name == movie.name);
        get(child(ref(database), `/${movieIndex}`))
          .then((snapshot) => {
            if (snapshot.exists()) {
              movie.inventory = snapshot.val().inventory;
            } else {
              console.log("No data available");
            }
          })
          .catch((error) => {
            console.error(error);
          });
        return;
      }
      const updates = {};
      updates[
        `/${this.movies.findIndex((m) => m.name == movie.name)}/inventory`
      ] = movie.inventory;
      return update(ref(database), updates)
        .then(() => {
          alert("儲存成功");
        })
        .catch((error) => {
          console.log(error);
          alert("儲存失敗");
          let movieIndex = this.movies.findIndex((m) => m.name == movie.name);
          get(child(ref(database), `/${movieIndex}`))
            .then((snapshot) => {
              if (snapshot.exists()) {
                movie.inventory = snapshot.val().inventory;
              } else {
                console.log("No data available");
              }
            })
            .catch((error) => {
              console.error(error);
            });
        });
    },
  },
  watch: {
    // 觀察購物車是否有加入點選的物件 cart size 變化
    cart() {
      TweenMax.from(".fa-cart-shopping", 0.3, { scale: 0.5 });
    },
  },
  computed: {
    totalPrice() {
      return this.cart
        .map((movie) => movie.price * movie.tickets)
        .reduce((total, p) => total + p, 0);
    },
    filterSearch() {
      return this.movies.filter((searchResult) =>
        searchResult.name.match(this.selectVal)
      );
    },
  },
});
