jQuery(window).load(
    function () {
        jQuery('#addGpsDataForm').hover(
            function () {
                var s = "<div data-info='{\"url\":\"/test\"}'  id='liveTracking' class='appButton unselectable' >Live Tracking</div><div data-info='{\"url\":\"/test2\"}' id='dashboard'  class='appButton unselectable'>Dashboard</div><div data-info='{\"url\":\"/test3\"}' id='playback'  class='appButton unselectable'>Playback</div>"
                jQuery(this).append(s)
            },
            function () {

                jQuery('#liveTracking').remove()
                jQuery('#dashboard').remove()
                jQuery('#playback').remove()
            }
        )


        jQuery('body').on('click', '.appButton', function () {
                var _button = jQuery(this)
                var info = _button.data().info

                //fitx.utils.loadPage (info.url)
                fitx.utils.pageWithParams(
                    info.url,
                    fitx.page2.requestNewTab(info.url)
                )
            }
        )
    }
)

