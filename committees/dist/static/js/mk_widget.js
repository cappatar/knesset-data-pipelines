function generateMkFrameSet(params) {
  var targetId = typeof(params.targetId) != 'undefined' ? params.targetId : false;
  var okURL = guessScriptURI();
  var classHook = typeof(params.classHook) != 'undefined' ? params.classHook : false;
	
	if ( okURL.charAt( okURL.length-1 ) != '/' )
	  okURL += '/';
	
  // add our stylesheet
  $('head').append('<link rel="stylesheet" href="'+okURL+'static/css/mk-iframe.css" type="text/css" />');
  var frameNum = 0;
  if (classHook) {
      var elements = jQuery('.'+classHook);
      elements.each(function(){
          var element = this;
          if (element.getAttribute('mk_id'))
              var frame = createMkFrame(element.getAttribute('mk_id'));
          else
              var frame = createMkFrame(element.innerHTML);
          if (targetId)
              jQuery('#'+targetId).append(frame);
          else {
              jQuery(element).after(frame);
              frame.style.display = "none";
          }
      });
      if (!targetId)
          elements.tooltip({position: "bottom center", delay: 1000} );
  }
  

  /* end of main */
  function guessScriptURI() {
        var re = /(http:\/\/[^\/]*)\/static\/js\/mk_widget.js/;
        var scripts = document.getElementsByTagName('script');
        for (var i=0; i<scripts.length; i++) {
          console.log(scripts[i].src);
          var m = scripts[i].src.match(re);
          if (m !== null)
            return m[1];
        }
        return 'http://oknesset.org';
  }
  function createMkFrame( mkId, width ){
    var mkFrame = document.createElement("div");
    mkFrame.src = okURL + "static/html/mk-iframe.html?id="+mkId;
    mkFrame.style.border =  "0px";
    mkFrame.style.margin =  "3px 0";
    mkFrame.style.width = "414px";
    mkFrame.style.height = "200px";
    // mkFrame.style.height = "100%";
	mkFrame.className = "autoHeight oknesset_frame";
    mkFrame.scrolling = "no";
    mkFrame.id = "mkFrame_"+frameNum;
    createMkPopup(mkFrame, mkId);
    frameNum++;
    return mkFrame;
  }
  // TODO: rinse! this function was copied from static/html/mk-iframe.html
  function createMkPopup(elem, mk) {
      var okURI = okURL.substr(0, okURL.length-1),
          mkId = Number(mk),
          params = {}, mkURI;

      if (isNaN(mkId)) {
          mkURI = okURI + "/api/v2/member/";
          params = ["name="+mk,
                "extra_fields=gender,is_current,roles,committees,bills_stats_proposed,bills_stats_approved,average_weekly_presence_rank"].join("&")
      } else {
          mkURI = okURI + "/api/v2/member/" + mkId + '/'
      }

      jQuery.ajax(mkURI, {processData: false, data :params,
        success: function(data){
          var mk_title = {'נקבה': {true: 'ח"כית מכהנת',
                                   false: 'ח"כית לשעבר' },
                          'זכר': {true: 'ח"כ מכהן',
                                  false: 'ח"כ לשעבר'}};
          function $E(s){
            return $(document.createElement(s));
          }

          var average_weekly_presence_des = ["אין מספיק נתונים","מועטה מאד","מועטה","בינונית","רבה","רבה מאד"];

          if (data.objects !== undefined)
            data = data.objects[0];
          var divId = "oknesset_mk_"+ data.id;
          var oknesset_main = $E('div')
            .attr({id:divId,class:"oknesset_frame"});
          var oknesset_content_top = $E("div")
            .attr({class:"oknesset_content_top"});
          oknesset_content_top.append($E("a")
                .attr({
                  href:okURI + "/member/"+data.id, target: "_blank"
                })
            .append($E("img").attr({ src: data.img_url, class:"oknesset_image"})
          ));
          oknesset_content_top.append($E("div").attr({class:"oknesset_name"})
              .append($E("a")
                .attr({href: okURI + "/member/"+data.id, target: "_blank"})
                .html(data.name))
              .append(" - " + mk_title[data.gender][data.is_current]));

          if (data.roles != 'Unknown')
            oknesset_content_top.append($E("div").attr({class:"oknesset_roles"}).html(data.roles));

          var oknesset_law_flow = $E("div")
            .attr({class:"oknesset_law_flow"});
          var oknesset_proposals = $E("a")
            .attr({class:"oknesset_proposals",
              href:okURI + "/bill/?member="+data.id+"&stage=proposed", target: "_blank"
            });
          oknesset_proposals.append($E("span").attr({class:"oknesset_proposals_number"}).html(data.bills_stats_proposed));
          oknesset_proposals.append($E("span").attr({class:"oknesset_proposals_desc"}).html("הצעות חוק"));

          oknesset_law_flow.append(oknesset_proposals);
          var oknesset_laws = $E("a")
            .attr({class:"oknesset_laws", href:okURI + "/bill/?member="+data.id+"&stage=approved", target:"_blank"});
          oknesset_laws.append($E("span")
              .attr({class:"oknesset_laws_number"}).html(data.bills_stats_approved+'~'));
          oknesset_laws.append($E("span").attr({class:"oknesset_laws_desc"})
              .html("חוקים התקבלו"));
          oknesset_law_flow.append(oknesset_laws);
          oknesset_content_top.append(oknesset_law_flow);
          oknesset_content_top.append($E("div").attr({class:"oknesset_attendance"}).html("נוכחות במשכן הכנסת: ").append($E("span").attr({class:"oknesset_attendance_value"}).html(average_weekly_presence_des[data.average_weekly_presence_rank])));
          oknesset_main.append(oknesset_content_top);

          var $oknesset_content_bottom = $E("div").attr({class:"oknesset_content_bottom"});

          $oknesset_content_bottom.append($E("div").attr({class:"oknesset_link"})
            .append($E("a")
                .attr({
                  href:okURI + "/member/"+data.id, target: "_blank"
                })
                .html('<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAE8AAABCCAMAAAAhdHtqAAAB+1BMVEVDQ0T///9DQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0RDQ0R/MmxgAAAAqXRSTlMAAAECAwQFBwgLDA0ODxAREhMUFRYXGBkaGxwdHh8gIiMlJigpKissLS4vMDEyMzQ1Njc5Ojs8PT9AQUJDRkdKS0xNTk9QUVJTVFVWV1hZW1xdX2BiY2RlaGlqbG1ub3Bxc3R1dnd5enx9fn+AgoOIiYqLjI2Oj5CRkpSVlpeYmZqbnJ2en6ChoqOkpaanqKmqq6ytrq+wsbKztLW4ubq7vL2+v8DBwsPEh640/AAAA3FJREFUWMPt1/lbEkEYB/BJiYgjNSmLyEojsUM7PHI7N0wOK6xMO7XDomyzFBE7NCvKUoQO09UOMTO/f2azQwQWcv9Qz8P7A+zOzPPhnWNnFrIss0Gy3j/okTTC6BCLMublH3204GvVZMgzXPkI/KglJBOe+rBrHjTmLuVmwCu98l7C8K69NDft/DRHnN8lbL7/kIoVpOUVnx9nqY3fMISKUveUXM9XCVsYrF8VLk3VK77oC6Z2rSwnsjwlT3nwwQzThkz5f1Sl4OnPBlP7dH2X7K/KZD1FTRcbNQyYtdHqk/P09hGGfb5TIYveIglPUSt8YdqLxnVLNkrYW2v3Mmy6s0oe40cT8+SVnVNMe9NUFHtEEvGK7J7gqAn75PHmK64nr+j8zDTPqfUJLKY4nvbkiwUJmxWqFQkt9Vhe7o6O4KgNN29K9Dlc2tNah1hqM0KNIvFdYgkvZ+ev1Maa9UltYVG91ccHWWrfuzllkhtsFK/kxixLzXuhJPndP4rX9qljFoFubmUqZ1MUT6MkwqXNKR6c0eeDHlRkXYGhVFFSrs4vpzOy3GBUqoylMpJLSzTbNysM2wp1ZIuxkBCV0SAvNq7JK9ev18RaLx0fIOr8qDOhkx6xIsqqIaqI7A2qOAwVz8HqyBnGaUL2IqB1ovUAutprYnk3wTzuGO7SJEQYaiCqiWyEefpvsDjIK9gJ2R30ONxri+l1AJM6Hzheyk81IXmT1HuNqjoM6gOw3CIeyavEjLYbrXUQsl4cb0JFloc9xyKPS8pTTmBrpLchAPMt8hJNzCtMKb/aiP7qAmhY5LXsh3A5nicGvbtBrzrkcXgq5efICXnansT6K+regjNBYP2l3hRbz9XU08/BIpBhafz2YFbbixb6fLTFfN+9APhVLlRV4Do9lXzYUIlB+lIwhLIKuNU+1JlJFyyEbAz4VrShaRda7DuW8M49dPe5RoGvTj88bvhcbtcX9D/Hu163axqPByD2TGHA6RrBiMvdOzfl9GDsEZ49f9LX11/+p7dCoznYaLPZGnjeRD/MNr6B3pl4m4U/Ti/qeauVr6dfFqkJq6q3mfkGK2+xWBsbT2xRqWWLPKM4+dbr9Y6OelmMhiN097siolkoxt6P+/MivDPt95Fu3L4a9vz07E43gLCXtzoDUZD9P531sl7W+5+8nyR+I3ng9uF9AAAAAElFTkSuQmCC"\
                alt="לדף האישי של "+data.name+" בכנסת הפתוחה" />' ))
          );


          if (typeof(data.committees) != 'undefined' && data.committees.length > 0) {
            var $oknesset_committees = $E("div").attr({class:"oknesset_committees"}).html("נוכחות עיקרית בוועדות:");
            var $oknesset_committees_ul = $E("ul");
            for (var i = 0; (i < 3) && (i < data.committees.length); ++i) {
              $oknesset_committees_ul.append($E("li").append($E("a")
                    .attr({
                      href: okURI + data.committees[i][1], target: "_blank"
                    })
                    .html(data.committees[i][0])));
            }

            $oknesset_committees.append($oknesset_committees_ul);
            $oknesset_content_bottom.append($oknesset_committees);
          }

          oknesset_main.append($oknesset_content_bottom);

          $(elem).append(oknesset_main);
        }})
    };
}
$(document).ready( function () {
  var re = /(אביגדור ליברמן|אבי וורצמן|אבישי ברוורמן|אברהים צרצור|אברהם מיכאלי|אופיר אקוניס|אורי אורבך|אורי יהודה אריאל|אורי מקלב|אורית סטרוק|אורלי לוי-אבקסיס|אחמד טיבי|איילת שקד|אילן גילאון|איציק שמולי|איתן כבל|אלי בן-דהן|אליהו ישי|אלכס מילר|אלעזר שטרן|אמנון כהן|אראל מרגלית|באסל גטאס|בועז טופורובסקי|בנימין נתניהו|גילה גמליאל|גלעד ארדן|ג`מאל זחאלקה|דב חנין|דב ליפמן|דוד אזולאי|דוד צור|דוד רותם|דני דנון|זאב אלקין|זבולון כלפה|זהבה גלאון|חיים כץ|חיליק בר|חמד עמאר|חנא סוייד|חנין זועבי|טלב אבו עראר|יאיר לפיד|יאיר שמיר|יואב בן צור|יואל רזבוזוב|יובל צלנר|יובל שטייניץ|יולי - יואל אדלשטיין|יוני שטבון|יעל גרמן|יעקב אשר|יעקב ליצמן|יעקב מרגי|יעקב פרי|יפעת קריב|יצחק אהרונוביץ|יצחק הרצוג|יצחק וקנין|יצחק כהן|יריב לוין|ישראל אייכלר|ישראל כץ|לאון ליטינצקי|לימור לבנת|מאיר כהן|מאיר פרוש|מאיר שטרית|מוחמד ברכה|מיכל בירן|מיכל רוזין|מיקי לוי|מיקי רוזנטל|מירי רגב|מנחם אליעזר מוזס|מסעוד גנאים|מרב מיכאלי|מרדכי יוגב|משה גפני|משה זלמן פייגלין|משה יעלון|משה מזרחי|משולם נהרי|נחמן שי|ניסן סלומינסקי|ניצן הורוביץ|נסים זאב|נפתלי בנט|סופה לנדבר|סילבן שלום|סתיו שפיר|עדי קול|עוזי לנדאו|עיסאווי פריג`|עליזה לביא|עמיר פרץ|עמר בר-לב|עמרם מצנע|עפו אגבאריה|עפר שלח|פאינה (פניה) קירשנבאום|פנינה תמנו-שטה|צחי הנגבי|ציפי חוטובלי|ציפי לבני|קארין אלהרר|רוברט אילטוב|רונן הופמן|רות קלדרון|רינה פרנקל|שאול מופז|שולי מועלם-רפאלי|שי פירון|שלי יחימוביץ|שמעון אוחיון|שמעון סולומון|תמר זנדברג|אביגדור ליברמן|אבי וורצמן|אבישי ברוורמן|אברהים צרצור|אברהם מיכאלי|אופיר אקוניס|אורי אורבך|אורי יהודה אריאל|אורי מקלב|אורית סטרוק|אורלי לוי-אבקסיס|אחמד טיבי|איילת שקד|אילן גילאון|איציק שמולי|איתן כבל|אלי בן-דהן|אליהו ישי|אלכס מילר|אלעזר שטרן|אמנון כהן|אראל מרגלית|באסל גטאס|בועז טופורובסקי|בנימין נתניהו|גילה גמליאל|גלעד ארדן|ג`מאל זחאלקה|דב חנין|דב ליפמן|דוד אזולאי|דוד צור|דוד רותם|דני דנון|זאב אלקין|זבולון כלפה|זהבה גלאון|חיים כץ|חיליק בר|חמד עמאר|חנא סוייד|חנין זועבי|טלב אבו עראר|יאיר לפיד|יאיר שמיר|יואב בן צור|יואל רזבוזוב|יובל צלנר|יובל שטייניץ|יולי - יואל אדלשטיין|יוני שטבון|יעל גרמן|יעקב אשר|יעקב ליצמן|יעקב מרגי|יעקב פרי|יפעת קריב|יצחק אהרונוביץ|יצחק הרצוג|יצחק וקנין|יצחק כהן|יריב לוין|ישראל אייכלר|ישראל כץ|לאון ליטינצקי|לימור לבנת|מאיר כהן|מאיר פרוש|מאיר שטרית|מוחמד ברכה|מיכל בירן|מיכל רוזין|מיקי לוי|מיקי רוזנטל|מירי רגב|מנחם אליעזר מוזס|מסעוד גנאים|מרב מיכאלי|מרדכי יוגב|משה גפני|משה זלמן פייגלין|משה יעלון|משה מזרחי|משולם נהרי|נחמן שי|ניסן סלומינסקי|ניצן הורוביץ|נסים זאב|נפתלי בנט|סופה לנדבר|סילבן שלום|סתיו שפיר|עדי קול|עוזי לנדאו|עיסאווי פריג`|עליזה לביא|עמיר פרץ|עמר בר-לב|עמרם מצנע|עפו אגבאריה|עפר שלח|פאינה (פניה) קירשנבאום|פנינה תמנו-שטה|צחי הנגבי|ציפי חוטובלי|ציפי לבני|קארין אלהרר|רוברט אילטוב|רונן הופמן|רות קלדרון|רינה פרנקל|שאול מופז|שולי מועלם-רפאלי|שי פירון|שלי יחימוביץ|שמעון אוחיון|שמעון סולומון|תמר זנדברג|איברהים צרצור|אורי אריאל|אורלי לוי אבקסיס|גמאל זחאלקה|חאמד עמר|חנא סוויד|ניצן הורביץ|ניסים זאב|עפו אגבריה|פאינה קירשנבאום|פניה קירשנבאום|פאינה קירשנבוים|יחיאל חיליק בר|זבולון קלפה)/g;

  $('body>[type!="text/javascript"]').each(function (i, el) {
    $(el).html($(el).html().replace(re, '<span class="oknesset_mk">$1</span>'));
  })
  generateMkFrameSet({classHook:'oknesset_mk'});
});

(function(f){function p(a,b,c){var h=c.relative?a.position().top:a.offset().top,d=c.relative?a.position().left:a.offset().left,i=c.position[0];h-=b.outerHeight()-c.offset[0];d+=a.outerWidth()+c.offset[1];if(/iPad/i.test(navigator.userAgent))h-=f(window).scrollTop();var j=b.outerHeight()+a.outerHeight();if(i=="center")h+=j/2;if(i=="bottom")h+=j;i=c.position[1];a=b.outerWidth()+a.outerWidth();if(i=="center")d-=a/2;if(i=="left")d-=a;return{top:h,left:d}}function u(a,b){var c=this,h=a.add(c),d,i=0,j=
0,m=a.attr("title"),q=a.attr("data-tooltip"),r=o[b.effect],l,s=a.is(":input"),v=s&&a.is(":checkbox, :radio, select, :button, :submit"),t=a.attr("type"),k=b.events[t]||b.events[s?v?"widget":"input":"def"];if(!r)throw'Nonexistent effect "'+b.effect+'"';k=k.split(/,\s*/);if(k.length!=2)throw"Tooltip: bad events configuration for "+t;a.bind(k[0],function(e){clearTimeout(i);if(b.predelay)j=setTimeout(function(){c.show(e)},b.predelay);else c.show(e)}).bind(k[1],function(e){clearTimeout(j);if(b.delay)i=
setTimeout(function(){c.hide(e)},b.delay);else c.hide(e)});if(m&&b.cancelDefault){a.removeAttr("title");a.data("title",m)}f.extend(c,{show:function(e){if(!d){if(q)d=f(q);else if(b.tip)d=f(b.tip).eq(0);else if(m)d=f(b.layout).addClass(b.tipClass).appendTo(document.body).hide().append(m);else{d=a.next();d.length||(d=a.parent().next())}if(!d.length)throw"Cannot find tooltip for "+a;}if(c.isShown())return c;d.stop(true,true);var g=p(a,d,b);b.tip&&d.html(a.data("title"));e=e||f.Event();e.type="onBeforeShow";
h.trigger(e,[g]);if(e.isDefaultPrevented())return c;g=p(a,d,b);d.css({position:"absolute",top:g.top,left:g.left});l=true;r[0].call(c,function(){e.type="onShow";l="full";h.trigger(e)});g=b.events.tooltip.split(/,\s*/);if(!d.data("__set")){d.bind(g[0],function(){clearTimeout(i);clearTimeout(j)});g[1]&&!a.is("input:not(:checkbox, :radio), textarea")&&d.bind(g[1],function(n){n.relatedTarget!=a[0]&&a.trigger(k[1].split(" ")[0])});d.data("__set",true)}return c},hide:function(e){if(!d||!c.isShown())return c;
e=e||f.Event();e.type="onBeforeHide";h.trigger(e);if(!e.isDefaultPrevented()){l=false;o[b.effect][1].call(c,function(){e.type="onHide";h.trigger(e)});return c}},isShown:function(e){return e?l=="full":l},getConf:function(){return b},getTip:function(){return d},getTrigger:function(){return a}});f.each("onHide,onBeforeShow,onShow,onBeforeHide".split(","),function(e,g){f.isFunction(b[g])&&f(c).bind(g,b[g]);c[g]=function(n){n&&f(c).bind(g,n);return c}})}f.tools=f.tools||{version:"1.2.5"};f.tools.tooltip=
{conf:{effect:"toggle",fadeOutSpeed:"fast",predelay:0,delay:30,opacity:1,tip:0,position:["top","center"],offset:[0,0],relative:false,cancelDefault:true,events:{def:"mouseenter,mouseleave",input:"focus,blur",widget:"focus mouseenter,blur mouseleave",tooltip:"mouseenter,mouseleave"},layout:"<div/>",tipClass:"tooltip"},addEffect:function(a,b,c){o[a]=[b,c]}};var o={toggle:[function(a){var b=this.getConf(),c=this.getTip();b=b.opacity;b<1&&c.css({opacity:b});c.show();a.call()},function(a){this.getTip().hide();
a.call()}],fade:[function(a){var b=this.getConf();this.getTip().fadeTo(b.fadeInSpeed,b.opacity,a)},function(a){this.getTip().fadeOut(this.getConf().fadeOutSpeed,a)}]};f.fn.tooltip=function(a){var b=this.data("tooltip");if(b)return b;a=f.extend(true,{},f.tools.tooltip.conf,a);if(typeof a.position=="string")a.position=a.position.split(/,?\s/);this.each(function(){b=new u(f(this),a);f(this).data("tooltip",b)});return a.api?b:this}})(jQuery);
