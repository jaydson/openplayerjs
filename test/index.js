describe('OpenPlayer.js', () => {
    let player;
    const iOS = /ipad|iphone|ipod/i.test(window.navigator.userAgent) && !window.MSStream;

    before(() => {
        player = new OpenPlayer('player1');
        player.init();
    });

    after(() => {
        player.destroy();
        player = null;
    });

    it('Creates an OpenPlayer instance', () => {
        expect(player instanceof OpenPlayer).to.equal(true);
    });

    it('Stores an instance of the current player', () => {
        expect(OpenPlayer.instances.player1).to.not.equal(undefined);
    });

    it('Returns the player\'s ID', () => {
        expect(player.id).to.equal('player1');
    });

    it('Detects if user is using a mouse (by default) or keyboard', () => {
        expect(player.getContainer().getAttribute('class').indexOf('om-player__keyboard--inactive') > -1).to.equal(true);
        const event = new CustomEvent('keydown');
        event.keyCode = 14;
        player.getContainer().dispatchEvent(event);
        expect(player.getContainer().getAttribute('class').indexOf('om-player__keyboard--inactive') === -1).to.equal(true);
    });

    it('Detects type of media to be played (i.e., video)', () => {
        expect(player.getContainer().getAttribute('class').indexOf('om-player__video') > -1).to.equal(true);
    });

    it('Detects if no Ads should to be played', () => {
        expect(player.isAd()).to.equal(false);
    });

    it('Displays the duration of media when player is loaded', function (done) {
        this.timeout(1500);
        setTimeout(() => {
            expect(player.getContainer().querySelector('.om-controls__duration').innerText).to.not.equal('00:00');
            done();
        }, 1000);
    });

    it('Autoplays if `autoplay` attribute is present', function (done) {
        this.timeout(1500);
        expect(player.autoplay).to.equal(false);
        player.autoplay = true;
        setTimeout(() => {
            expect(player.autoplay).to.equal(true);
            player.pause();
            player.autoplay = false;
            expect(player.autoplay).to.equal(false);
            done();
        }, 1000);
    });

    it('Allows user to manipulate player with keyboard', function (done) {
        this.timeout(3500);
        const event = new CustomEvent('keydown');
        event.keyCode = 39;
        player.element.dispatchEvent(event);
        expect(player.media.currentTime > 0).to.equal(true);
        const e = new CustomEvent('keydown');
        e.keyCode = 37;
        player.element.dispatchEvent(e);
        expect(player.media.currentTime === 0).to.equal(true);

        const playEvent = new CustomEvent('keydown');
        playEvent.keyCode = 13;
        player.element.dispatchEvent(playEvent);

        setTimeout(() => {
            expect(player.media.paused).to.equal(false);
            const pauseEvent = new CustomEvent('keydown');
            pauseEvent.keyCode = 13;
            player.element.dispatchEvent(pauseEvent);
            setTimeout(() => {
                expect(player.media.paused).to.equal(true);
                player.media.currentTime = 0;
                done();
            }, 1000);
        }, 2000);
    });

    it('Plays/pauses media correctly', function (done) {
        this.timeout(3500);
        player.play();
        setTimeout(() => {
            expect(player.getContainer().querySelector('.om-player__play--paused')).to.not.equal(null);
            player.pause();
            setTimeout(() => {
                expect(player.getContainer().querySelector('.om-controls__current').innerText).to.equal('00:01');
                expect(player.getContainer().querySelector('.om-player__play--paused')).to.equal(null);
                done();
            }, 1000);
        }, 2000);
    });

    it('Creates controls if browser is not iOS', () => {
        if (iOS) {
            expect(player.getContainer().querySelector('.om-controls')).to.equal(null);
        } else {
            expect(player.getContainer().querySelector('.om-controls')).to.not.equal(null);
        }
    });

    it('Creates play/loader button at the level of media display element', () => {
        expect(player.getContainer().querySelector('.om-player__play')).to.not.equal(null);
        expect(player.getContainer().querySelector('.om-player__loader')).to.not.equal(null);
    });

    it('Detects captions if `track` tag(s) present', () => {
        const trackTags = player.element.querySelectorAll('track');
        expect(player.getContainer().getAttribute('class').indexOf('om-captions--detected') > -1).to.equal(!!trackTags.length);
    });

    it('Displays captions automatically if `track` tag(s) present', function (done) {
        this.timeout(2500);
        if (iOS) {
            expect(player.getContainer().querySelector('.om-controls__captions')).to.equal(null);
            done();
        } else {
            expect(player.getContainer().querySelector('.om-controls__captions').getAttribute('class').indexOf('om-controls__captions--on') > -1).to.equal(true);
            player.play();
            setTimeout(() => {
                expect(!!player.getContainer().querySelector('.om-captions>span').innerHTML.length).to.equal(true);
                player.pause();
                done();
            }, 2000);
        }
    });

    it('Adds caption dynamically and renders it if `default` attribute is passed in object', () => {
        player.addCaptions({
            srclang: 'br_PT',
            src: 'http://brenopolanski.com/html5-video-webvtt-example/MIB2-subtitles-pt-BR.vtt',
            kind: 'subtitles',
            label: 'Portuguese (BR)',
            default: true
        });

        expect(player.getContainer().querySelector('.om-settings__menu-label[data-value="captions-br_PT"]')).to.not.equal(null);
    });

    it('Mutes/unmutes media when clicking on `Mute` button', function (done) {
        this.timeout(1500);
        const mute = player.getContainer().querySelector('.om-controls__mute');
        const event = new CustomEvent('click');
        mute.dispatchEvent(event);
        expect(player.getContainer().querySelector('.om-controls__mute--muted')).to.not.equal(null);
        setTimeout(() => {
            const e = new CustomEvent('click');
            mute.dispatchEvent(e);
            expect(player.getContainer().querySelector('.om-controls__mute--muted')).to.equal(null);
            done();
        }, 1000);
    });

    it('Renders a `fullscreen` button only for video', () => {
        if (iOS) {
            expect(player.getContainer().querySelector('.om-controls__fullscreen')).to.equal(null);
        } else {
            expect(player.getContainer().querySelector('.om-controls__fullscreen')).to.not.equal(null);
        }
    });

    // it('Toggles fullscreen when clicking on `Fullscreen` button', function (done) {
    //     this.timeout(3500);
    //     const fullscreen = player.getContainer().querySelector('.om-controls__fullscreen');
    //     const event = new CustomEvent('click');
    //     fullscreen.dispatchEvent(event);
    //     done();
    //     setTimeout(() => {
    //         expect(player.getContainer().querySelector('.om-controls__fullscreen--out')).to.not.equal(null);
    //         const e = new CustomEvent('click');
    //         fullscreen.dispatchEvent(e);
    //         setTimeout(() => {
    //             expect(player.getContainer().querySelector('.om-controls__fullscreen--out')).to.equal(null);
    //             done();
    //         }, 1000);
    //     }, 1000);
    // });

    it('Toggles settings when clicking on button', function (done) {
        this.timeout(1500);
        const button = player.getContainer().querySelector('.om-controls__settings');
        const event = new CustomEvent('click');
        button.dispatchEvent(event);
        expect(player.getContainer().querySelector('.om-settings').getAttribute('aria-hidden')).to.equal('false');
        setTimeout(() => {
            button.dispatchEvent(event);
            expect(player.getContainer().querySelector('.om-settings').getAttribute('aria-hidden')).to.equal('true');
            done();
        }, 1000);
    });

    it('Changes source correctly (from MP4 to HLS, and viceversa)', function (done) {
        this.timeout(4000);
        player.src = 'https://video-dev.github.io/streams/x36xhzz/x36xhzz.m3u8';
        player.load();
        player.play();
        setTimeout(() => {
            expect(player.src[0].src).to.equal('https://video-dev.github.io/streams/x36xhzz/x36xhzz.m3u8');
            expect(player.src[0].type).to.equal('application/x-mpegURL');
            player.pause();
            player.src = 'http://rmcdn.2mdn.net/Demo/vast_inspector/android.mp4';
            player.load();
            expect(player.src[0].src).to.equal('http://rmcdn.2mdn.net/Demo/vast_inspector/android.mp4');
            expect(player.src[0].type).to.equal('video/mp4');
            done();
        }, 3000);
    });

    it('Destroys player correctly', () => {
        player.destroy();
        expect(player.getContainer().getAttribute('class').indexOf('.om-player') > -1).to.equal(false);
    });
});