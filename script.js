var vm = new Vue({
  el: "#app",
  data: {
    isCartOpen: false,
    movies: [],
    cart: [],
    currentMovie: null,
  },
  // 取得電影資料
  created() {
    let apiUrl = "movie.json";
    axios.get(apiUrl).then((res) => {
      this.movies = res.data;
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
      TweenMax.to(".cards", 0.8, {
        left: "+=" + -evt.deltaY * 3 + "px",
      });
    },
    addCart(movie, evt) {
      this.currentMovie = movie;
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
        this.cart.push(movie);
      }, 1000);
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
        .map((movie) => movie.price)
        .reduce((total, p) => total + p, 0);
    },
  },
});
