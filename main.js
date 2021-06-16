/**
 * 1. Render songs
 * 2. Scroll top
 * 3. Play/pause/seek
 * 4. CD rotate
 * 5. Next/prev
 * 6. Random
 * 7. Next/repeat when ended
 * 8. Active song
 * 9. Scroll active song into view
 * 10. Play song when clicked
 */
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const PLAYER_STORAGE_KEY = 'Ng_PLAYER';

const cd = $('.cd');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');
const player = $('.player');
const progress = $('#progress');
const prevBtn = $(".btn-prev");
const nextBtn = $(".btn-next");
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playList = $('.playlist');

const app = {
    currentIndex: 0, //the first song
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    // config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {}, //??
    songs: [
        {
            name: "Mean it",
            singer: "Lauv",
            path: './music/mean-it.mp3',
            image: './images/lauv.jpg'
          },
        {
            name: "Let's fall in love for the night",
            singer: "FINNEAS",
            path: './music/Lets-Fall-In-Love-For-The-Night.mp3',
            image: './images/FINNEAS.jpg'
        },
      {
        name: "Older",
        singer: "Sasha Sloan",
        path: './music/older.mp3',
        image: './images/sasha-sloan.jpg'
      },
      {
        name: "Watermelon sugar",
        singer: "Harry Styles",
        path: './music/Watermelon-Sugar.mp3',
        image: './images/harry-styles.jpg'
      },
      {
        name: "Có khi",
        singer: "Phong Ngủ Yên",
        path: "./music/co-khi.mp3",
        image:'./images/phong-ngu-yen.jpg'
      },
      {
        name: "itsokayitsokayiloveyou",
        singer: "kiệt",
        path:'./music/itsokayitsokayiloveyou.mp3',
        image:'./images/pic1.jpg'
      },
      {
        name: "Younger",
        singer: "A great big world",
        path: "/.music/younger.mp3",
        image:'./images/a-great-big-world.jpg'
      }
    ],
    // setConfig: function(key, value){
    //     this.config[key] = value;
    //     localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    // },
    render: function(){
        const htmls = this.songs.map((song, index) => {
            return`
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                <div class="thumb"
                    style="background-image: url('${song.image}');">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
                </div>
            `;
        })
        playList.innerHTML = htmls.join('');
    },

    defineProperties: function(){
        Object.defineProperty(this, 'currentSong', {
            get: function(){
                return this.songs[this.currentIndex]
            }
        })
    },

    handleEvents: function(){
        const _this = this; //_this~app
        const cdWidth = cd.offsetWidth;

        // Xử lý phóng to / thu nhỏ CD khi scroll màn hình
        document.onscroll = function(){
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        }
        
        // Xử lý CD quay / dừng
        const cdThumbAnimate = cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ], {
            duration: 10000, //10s
            iterations: Infinity,
        })
        cdThumbAnimate.pause()

        // Xử lý khi click play
        playBtn.onclick = function(){
            // if(_this.isPlaying){ // if playing => pause
            //     _this.isPlaying = false;
            //     audio.pause();
            //     player.classList.remove('playing');
            // }
            // else{
            //     _this.isPlaying = true;
            //     audio.play();
            //     player.classList.add('playing');
            // }
            if(_this.isPlaying){
                audio.pause();
            }else{
                audio.play();
            }
            // Khi song được play
            audio.onplay = function(){
                _this.isPlaying = true;
                player.classList.add('playing');
                cdThumbAnimate.play(); // tiếp tục quay CD
            }
            // Khi song bị pause
            audio.onpause = function(){
                _this.isPlaying = false;
                player.classList.remove('playing');
                cdThumbAnimate.pause(); // dừng quay CD
            }

            // Khi tiến độ bài hát thay đổi
            audio.ontimeupdate = function(){
                if(audio.duration){ // !NaN (duration: độ dài bài hát)
                    const progressPercent = Math.floor(audio.currentTime / audio.duration * 100); // phần trăm thời lượng bài hát đang chạy
                    progress.value = progressPercent; 
                }
            }

            // Tua bài hát
            progress.onchange = function(e){
                const seekTime = audio.duration / 100 * e.target.value;
                audio.currentTime = seekTime;
            }

            // Next song
            nextBtn.onclick = function(){
                if(_this.isRandom){
                    _this.playRandomSong();
                }else{
                    _this.nextSong();
                }
                audio.play();
                _this.render();
                _this.scrollToActiveSong();
            }
            // Prev song
            prevBtn.onclick = function(){
                if(_this.isRandom){
                    _this.playRandomSong();
                }else{    
                    _this.prevSong(); 
                }
                audio.play();
                _this.render();
                _this.scrollToActiveSong();
            }
            // Bật / tắt chế độ random
            randomBtn.onclick = function(e){
                _this.isRandom = !_this.isRandom;
                // _this.setConfig('isRandom', _this.isRandom);
                randomBtn.classList.toggle('active', _this.isRandom);
                
            }

            // Xử lý phát tiếp khi hết bài
            audio.onended = function(){
                if(_this.isRepeat){
                    audio.play();
                }else{
                    nextBtn.click();
                }
                
            }

            // Lặp lại bài hát
            repeatBtn.onclick = function(){
                _this.isRepeat = !_this.isRepeat;
                // _this.setConfig('isRepeat', _this.isRepeat);
                repeatBtn.classList.toggle('active', _this.isRepeat);
            }

            // Lắng nghe hành vi click vào playlist
            playList.onclick = function(e){
                //console.log(e.target)
                const songNode = e.target.closest('.song:not(.active)');
                if(songNode || e.target.closest('.option')){
                    // Xử lý khi click vào bài hát
                    if(songNode){
                        _this.currentIndex = Number(songNode.dataset.index);
                        _this.loadCurrentSong();
                        _this.render();
                        audio.play();
                    }
                }
            }

        }
        
    },

    // loadConfig: function(){
    //     this.isRandom = this.config.isRandom;
    //     this.isRepeat = this.config.isRepeat;
    // },

    loadCurrentSong: function(){

        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },

    nextSong: function(){
        this.currentIndex++;
        if(this.currentIndex >= this.songs.length){
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },

    prevSong: function(){
        this.currentIndex--;
        if(this.currentIndex < 0){
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },
    
    playRandomSong: function(){
        let newIndex;
        do{
            newIndex = Math.floor(Math.random() * this.songs.length);
        }
        while(newIndex === this.currentIndex);
        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },

    scrollToActiveSong: function(){
        setTimeout(() => {
            if(this.currentIndex > 5){
                $('.song.active').scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest'
                })
            }else{
                $('.song.active').scrollIntoView({
                    behavior: 'smooth',
                    block: 'end'
                })
            }
            
        }, 300)
    },

    start: function(){
        // Gán cấu hình từ config vào ứng dụng
        // this.loadConfig();

        // Định nghĩa các thuộc tính cho object
        this.defineProperties();

        // Lắng nghe / xử lý các sự kiện
        this.handleEvents();

        // Load bài hát vào UI 
        this.loadCurrentSong();

        // Render playlist
        this.render();

        //Hiển thị trạng thái ban đầu của button repeat và random
        // randomBtn.classList.toggle('active', _this.isRepeat);
        // randomBtn.classList.toggle('active', _this.isRandom);
    }    
}

app.start();