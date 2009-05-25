(function($) {
  $.fn.githubVoice = function(user, repository, options) {
    var cache    = null;
    var settings = $.extend(true, {}, $.fn.githubVoice.defaults, options);

    function onComplete(data) {
      cache = data;

      var sort  = settings.sort,
          list  = $('#github-voice ol').empty(),
          count = 0,
          valid;

      data.issues.sort($.isFunction(sort)
                       ? sort
                       : function(a, b) {
                           return ((a[sort] < b[sort]) ? 1 : ((a[sort] > b[sort]) ? -1 : 0));
                          }
                      );

      $.each(data.issues, function(index, issue) {
        if (settings.filter) {
          valid = true;

          $.each(settings.filter, function(key, value) {
            if (!issue[key].match(value)) {
              valid = false;

              return false;
            }
          });

          if (!valid) {
            return;
          }
        }

        list.append('<li>' +
          '<p class="votes">' +
            '<em>' + issue.votes + '</em> votes' +
          '</p>' +
          '<h3><a href="http://github.com/' + user + '/' + repository + '/issues#issue/' + issue.number + '">' + issue.title + '</a></h3>' +
        '</li>');

        if (++count == settings.limit) {
          return false;
        }
      });

      $('#github-voice p.call-to-action a').append('<span> (' + data.issues.length + ' ideas)</span>')

      updatePosition();
    }

    function updatePosition() {
      $('#github-voice-wrapper').css('margin-top', -1 * ($('#github-voice-wrapper').height() / 2));
    }

    return this.each(function() {
      $(this).click(function() {
        if (settings.overlay) {
          $('body')
            .append('<div id="github-voice-overlay"></div>')
            .find('#github-voice-overlay')
              .css({
                width   : $(window).width(),
                height  : $(document).height(),
                opacity : 0.75
              })
              .click(function() {
                $('#github-voice-overlay, #github-voice-wrapper').remove();
              });
        }

        $('body')
          .append(settings.html)
          .find('#github-voice')
            .find('p.description').html(settings.text.description).end()
            .find('li.loading').html(settings.text.loading).end()
            .find('p.call-to-action a')
              .html(settings.text.callToAction)
              .attr('href', 'http://github.com/' + user + '/' + repository + '/issues');

        updatePosition();

        if (cache) {
          onComplete(cache)
        } else {
          $.getJSON('http://github.com/api/v2/json/issues/list/' + user + '/' + repository + '/open?callback=?', onComplete);
        }

        return false;
      });
    });
  };

  $.fn.githubVoice.defaults = {
    sort    : 'votes',
    limit   : 5,
    overlay : true,
    filter  : null,
    text    : {
      loading     : "Loading...",
      description : "We've setup a feedback forum so you can tell us what's on your mind. Please go there and be heard!",
      callToAction: "&raquo; Go to our Feedback Forum"
    },
    html : '\
    <div id="github-voice-wrapper"> \
      <h1>Feedback</h1> \
      <div id="github-voice"> \
        <p class="description"></p> \
        <ol> \
          <li class="loading"></li> \
        </ol> \
        <p class="call-to-action"><a href="#"></a></p> \
      </div> \
    </div>'
  };
})(jQuery);