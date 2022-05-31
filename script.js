var vm = new Vue({
  el: "#app",
  data: {
    movies: [],
    cart: [],
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
    addCart(movie) {
      this.cart.push(movie);
    },
  },
});
