var FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSfzabq7Ah7sGN_v6ApSO7OKG5rUKJwgjtHIf_9dXdfYgJ0iFQ/formResponse";
  var FIELD = {
    teacher: "entry.553631712",
    subject: "entry.1220593235",
    topic:   "entry.1738076249",
    batch:   "entry.601322218",
    lecture: "entry.2007937138",
    date:    "entry.319678299"
  };

  var $ = function(id){return document.getElementById(id);};
  var form=$("f"), btn=form.querySelector("button[type=submit]"), err=$("err");
  var lecturePage=$("lecturePage"), boardPage=$("boardCard");
  function showPage(page){var showBoard=page==="videos",next=showBoard?boardPage:lecturePage,other=showBoard?lecturePage:boardPage;if(next.hidden){other.classList.remove("is-active");other.hidden=true;next.hidden=false;void next.offsetWidth;next.classList.add("is-active");window.scrollTo({top:0,behavior:"smooth"});}}
  $("nav-lecture").addEventListener("change",function(){if(this.checked)showPage("lecture");}); $("nav-videos").addEventListener("change",function(){if(this.checked)showPage("videos");});
  var themeSwitch=$("themeSwitch"), themeLabel=$("themeLabel"), THEME_KEY="momentumColorMode.v1";
  function setTheme(isDark,save){
    document.body.classList.toggle("theme-dark",isDark);
    themeSwitch.setAttribute("aria-checked",String(isDark));
    themeLabel.textContent=isDark?"Night mode":"Day mode";
    document.documentElement.style.colorScheme=isDark?"dark":"light";
    if(save){try{localStorage.setItem(THEME_KEY,isDark?"dark":"light");}catch(e){}}
  }
  var savedTheme="light"; try{savedTheme=localStorage.getItem(THEME_KEY)||"light";}catch(e){}
  setTheme(savedTheme==="dark",false);
  themeSwitch.addEventListener("click",function(){setTheme(themeSwitch.getAttribute("aria-checked")!=="true",true);});

  function setToday(){
    var d=new Date(), p=function(n){return String(n).padStart(2,"0")};
    $("date").value=d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());
  }
  setToday();

  // Replace native select menus with animated accessible menus while keeping
  // the original select elements as the values submitted with the form.
  function enhanceSelect(id,label){
    var native=$(id), wrap=document.createElement("div");
    wrap.className="custom-select";
    native.parentNode.insertBefore(wrap,native);
    wrap.appendChild(native);
    native.classList.add("native-select-hidden");
    native.required=false;
    var button=document.createElement("button");
    button.type="button"; button.className="custom-select-button"; button.setAttribute("aria-haspopup","listbox"); button.setAttribute("aria-expanded","false"); button.setAttribute("aria-label",label);
    var value=document.createElement("span"); value.className="custom-select-value";
    var chevron=document.createElement("span"); chevron.className="custom-select-chevron"; chevron.setAttribute("aria-hidden","true"); chevron.textContent="▾";
    button.appendChild(value); button.appendChild(chevron); wrap.appendChild(button);
    var list=document.createElement("div"); list.className="custom-select-menu"; list.setAttribute("role","listbox"); list.setAttribute("aria-label",label+" options"); wrap.appendChild(list);
    var options=[];
    Array.prototype.forEach.call(native.options,function(item){
      if(!item.value) return;
      var option=document.createElement("button"); option.type="button"; option.className="custom-select-option"; option.setAttribute("role","option"); option.textContent=item.textContent.trim(); option.dataset.value=item.value;
      option.addEventListener("click",function(){native.value=item.value;native.dispatchEvent(new Event("change",{bubbles:true}));value.textContent=item.textContent.trim();button.classList.add("has-value");list.classList.remove("is-open");button.setAttribute("aria-expanded","false");button.focus();});
      list.appendChild(option); options.push(option);
    });
    function sync(){value.textContent=native.value?native.options[native.selectedIndex].textContent.trim():"Choose";button.classList.toggle("has-value",!!native.value);options.forEach(function(o){o.classList.toggle("is-selected",o.dataset.value===native.value);o.setAttribute("aria-selected",String(o.dataset.value===native.value));});}
    button.addEventListener("click",function(){var open=!list.classList.contains("is-open");list.classList.toggle("is-open",open);button.setAttribute("aria-expanded",String(open));});
    button.addEventListener("keydown",function(e){if(e.key==="ArrowDown"||e.key==="Enter"||e.key===" "){e.preventDefault();list.classList.add("is-open");button.setAttribute("aria-expanded","true");var idx=Math.max(0,options.findIndex(function(o){return o.dataset.value===native.value;}));options[idx].focus();}});
    list.addEventListener("keydown",function(e){var idx=options.indexOf(document.activeElement);if(e.key==="ArrowDown"||e.key==="ArrowUp"){e.preventDefault();options[(idx+(e.key==="ArrowDown"?1:-1)+options.length)%options.length].focus();}else if(e.key==="Escape"){list.classList.remove("is-open");button.setAttribute("aria-expanded","false");button.focus();}});
    native.addEventListener("change",sync); sync();
    return {native:native,button:button,list:list};
  }
  var teacherSelect=enhanceSelect("teacher","Teacher"), subjectSelect=enhanceSelect("subject","Subject");
  document.addEventListener("click",function(e){[teacherSelect,subjectSelect].forEach(function(control){if(!control.button.parentNode.contains(e.target)){control.list.classList.remove("is-open");control.button.setAttribute("aria-expanded","false");}});});

  // Suggestions stay on this device and are scoped to teacher and subject.
  var ENTRY_CACHE_KEY = "momentumLectureEntries.v1";
  function readEntryCache(){ try { var data=JSON.parse(localStorage.getItem(ENTRY_CACHE_KEY)||"[]"); return Array.isArray(data)?data:[]; } catch(e){ return []; } }
  function refreshSuggestions(activeId){
    var teacher=$("teacher").value, subject=$("subject").value;
    var history=readEntryCache().filter(function(x){return x && x.teacher===teacher && x.subject===subject;});
    [["batchName","batch","batchSuggestions"],["lecture","lecture","lectureSuggestions"],["topic","topic","topicSuggestions"]].forEach(function(pair){
      var input=$(pair[0]), menu=$(pair[2]), values=[];
      history.forEach(function(item){if(item[pair[1]] && values.indexOf(item[pair[1]])<0) values.push(item[pair[1]]);});
      var query=input.value.trim().toLowerCase();
      var matches=values.filter(function(value){return !query || value.toLowerCase().indexOf(query)>=0;}).slice(0,12);
      menu.replaceChildren();
      matches.forEach(function(value){var option=document.createElement("button");option.type="button";option.className="suggestion-option";option.setAttribute("role","option");option.textContent=value;option.addEventListener("mousedown",function(e){e.preventDefault();input.value=value;input.dataset.selectedSuggestion=value;menu.classList.remove("open");input.setAttribute("aria-expanded","false");input.focus();});menu.appendChild(option);});
      var show=activeId===pair[0] && matches.length>0; menu.classList.toggle("open",show); input.setAttribute("aria-expanded",String(show));
    });
  }
  function rememberEntry(entry){
    try { var history=readEntryCache().filter(function(x){return !(x.teacher===entry.teacher && x.subject===entry.subject && x.batch===entry.batch && x.lecture===entry.lecture && x.topic===entry.topic);}); history.unshift(entry); localStorage.setItem(ENTRY_CACHE_KEY,JSON.stringify(history.slice(0,60))); refreshSuggestions(); }
    catch(e) { /* Suggestions are optional when browser storage is unavailable. */ }
  }
  $("teacher").addEventListener("change",refreshSuggestions); $("subject").addEventListener("change",refreshSuggestions);
  ["batchName","lecture","topic"].forEach(function(id){$(id).addEventListener("focus",function(){refreshSuggestions(id);});$(id).addEventListener("input",function(){refreshSuggestions(id);});$(id).setAttribute("aria-autocomplete","list");$(id).setAttribute("aria-controls",id==="batchName"?"batchSuggestions":id==="lecture"?"lectureSuggestions":"topicSuggestions");$(id).addEventListener("keydown",function(e){var menu=$(id==="batchName"?"batchSuggestions":id==="lecture"?"lectureSuggestions":"topicSuggestions"), options=Array.prototype.slice.call(menu.querySelectorAll(".suggestion-option")), active=options.findIndex(function(o){return o.classList.contains("is-highlighted");});if(e.key==="Escape"){menu.classList.remove("open");$(id).setAttribute("aria-expanded","false");return;}if(e.key==="ArrowDown"||e.key==="ArrowUp"){e.preventDefault();if(!menu.classList.contains("open"))refreshSuggestions(id);options=Array.prototype.slice.call(menu.querySelectorAll(".suggestion-option"));if(!options.length)return;options.forEach(function(o){o.classList.remove("is-highlighted");});active=(active+(e.key==="ArrowDown"?1:-1)+options.length)%options.length;options[active].classList.add("is-highlighted");options[active].scrollIntoView({block:"nearest"});}else if(e.key==="Enter"&&menu.classList.contains("open")){var chosen=active>-1?options[active]:null;if(chosen){e.preventDefault();chosen.dispatchEvent(new MouseEvent("mousedown",{bubbles:true}));}}});}); refreshSuggestions();
  document.addEventListener("click",function(e){if(!e.target.closest(".autocomplete")) refreshSuggestions();});
  form.addEventListener("submit",function(e){
    e.preventDefault();
    if(btn.disabled) return;
    err.style.display="none";
    if(!teacherSelect.native.value || !subjectSelect.native.value){err.textContent="Please choose a teacher and subject.";err.style.display="block";(!teacherSelect.native.value?teacherSelect.button:subjectSelect.button).focus();return;}
    var v=function(id){return $(id).value.trim();};
    var teacherName=v("teacher");
    var entry={teacher:teacherName,subject:v("subject"),batch:v("batchName"),lecture:v("lecture"),topic:v("topic")};
    var dt=v("date").split("-");
    var body=new URLSearchParams();
    body.set(FIELD.teacher,v("teacher"));
    body.set(FIELD.subject,v("subject"));
    body.set(FIELD.topic,v("topic"));
    body.set(FIELD.batch,v("batchName"));
    body.set(FIELD.lecture,v("lecture"));
    body.set(FIELD.date+"_year",dt[0]);
    body.set(FIELD.date+"_month",String(parseInt(dt[1],10)));
    body.set(FIELD.date+"_day",String(parseInt(dt[2],10)));

    btn.disabled=true; btn.textContent="Submitting\u2026";
    fetch(FORM_URL,{method:"POST",mode:"no-cors",body:body})
      .then(function(){
        rememberEntry(entry);
        form.style.display="none";
        $("thanks").classList.add("show");
        // one lecture submitted = one less video to arrange for that teacher
        for(var k=0;k<BOARD.length;k++){ if(BOARD[k].n===teacherName){ change(k,-1); break; } }
      })
      .catch(function(){
        err.textContent="Could not submit. Please check your internet connection and try again.";
        err.style.display="block";
      })
      .then(function(){ btn.disabled=false; btn.textContent="Continue"; });
  });

  $("again").addEventListener("click",function(){
    $("lecture").value=""; $("topic").value=""; setToday();
    $("thanks").classList.remove("show");
    form.style.display="block";
    $("lecture").focus();
  });

  // ---------- Videos to arrange (shared counts) ----------
  // Use this Apps Script deployment URL while running this page from VS Code.
  // After saving Code.gs, deploy a new version at the same /exec URL.
  var APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxpbyEiDMjj1JyDqlG6EM71qoa8r0r46Vj-2x7lEh12PFfM3WoYn6wIxZwp_grewrBY/exec";
  var BOARD = [
    {n:"Vikas Sir",   i:"VS",c:"#e0309a",t:"rgba(240,80,170,.15)"},
    {n:"Sudhanshu Sir",i:"SS",c:"#2b8cf0",t:"rgba(43,140,240,.15)"},
    {n:"Subodh Sir",   i:"SB",c:"#8a3fe0",t:"rgba(138,63,224,.14)"},
    {n:"Aditya Sir",   i:"AS",c:"#12985f",t:"rgba(18,152,95,.15)"},
    {n:"Durgesh Sir",  i:"DS",c:"#e0285a",t:"rgba(240,80,110,.15)"},
    {n:"Nitish Sir",   i:"NS",c:"#ee7a12",t:"rgba(255,150,40,.17)"},
    {n:"Ashwani Sir",  i:"AS",c:"#2f6fe8",t:"rgba(47,111,232,.14)"},
    {n:"CP Sir",       i:"CP",c:"#7c4ae0",t:"rgba(124,74,224,.14)"},
    {n:"Pankaj Sir",   i:"PS",c:"#10a56a",t:"rgba(16,165,106,.15)"},
    {n:"Shivam sir",   i:"SV",c:"#10a56a",t:"rgba(16,165,106,.15)"},
    {n:"Om Sir",       i:"OM",c:"#10a56a",t:"rgba(16,165,106,.15)"},
    {n:"Sandeep Sir",  i:"SS",c:"#10a56f",t:"rgba(16,165,111,.15)"},
    {n:"Alok Sir",     i:"AS",c:"#10a56a",t:"rgba(16,165,106,.15)"},
    {n:"Aditi ma'm",   i:"AM",c:"#10a56a",t:"rgba(16,165,106,.15)"},
    {n:"Nikita ma'm",  i:"NM",c:"#10a56a",t:"rgba(16,165,106,.15)"}
  ];
  var DEMO = [0,0,13,0,0,0,13,1,0,2,0,1,0,0,0]; // demo counts for local testing
  var onServer = !!(window.google && google.script && google.script.run);
  var LOCAL_COUNTS_KEY = "momentumTeacherCounts.v1";
  var counts = {}, pending = {}, inflight = {}, timers = {};
  var remoteLoadInProgress = false;

  function paint(i, pop){
    var el=$("n-"+i), v=counts[BOARD[i].n];
    el.textContent = (v===undefined) ? "\u2013" : v;
    if(pop){ el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop"); }
  }
  function paintAll(){ BOARD.forEach(function(_,i){ paint(i); }); }

  (function build(){
    var box=$("board");
    BOARD.forEach(function(t,i){
      var r=document.createElement("div");
      r.className="trow"; r.style.setProperty("--c",t.c); r.style.setProperty("--t",t.t);
      r.innerHTML='<div class="av">'+t.i+'</div><div class="nm">'+t.n+'</div>'+
        '<div class="num" id="n-'+i+'" aria-live="polite">\u2013</div>';
      box.appendChild(r);
    });
  })();

  function busy(){
    return Object.keys(timers).some(function(k){return pending[k]||inflight[k];});
  }
  function status(msg){ $("status").textContent=msg||""; }

  function saveLocalCounts(){
    try{
      localStorage.setItem(LOCAL_COUNTS_KEY,JSON.stringify(counts));
      return true;
    }catch(e){
      status("Could not save counts in this browser.");
      return false;
    }
  }

  function loadRemoteCounts(){
    if(remoteLoadInProgress) return;
    remoteLoadInProgress=true;
    var callbackName="__momentumCounts_"+Date.now()+"_"+Math.floor(Math.random()*1000000);
    var script=document.createElement("script");
    var finished=false;
    function finish(){
      if(finished) return;
      finished=true;
      remoteLoadInProgress=false;
      if(script.parentNode) script.parentNode.removeChild(script);
      try{ delete window[callbackName]; }catch(e){ window[callbackName]=undefined; }
    }
    window[callbackName]=function(result){
      finish();
      if(result && result.ok && result.data){
        counts=result.data;
        paintAll();
        status("Video counts loaded from Google Sheet Do not spam on Submission.");

      }else{
        status("Could not load counts from the Google Sheet.");
      }
    };
    script.onerror=function(){ finish(); status("Could not reach the Google Sheet service."); };
    script.src=APPS_SCRIPT_URL+"?action=getCounts&callback="+encodeURIComponent(callbackName)+"&t="+Date.now();
    document.head.appendChild(script);
  }

  function load(){
    if(busy()) return;
    if(!onServer){
      if(APPS_SCRIPT_URL){ loadRemoteCounts(); return; }
      var saved={};
      try{ saved=JSON.parse(localStorage.getItem(LOCAL_COUNTS_KEY)||"{}"); }catch(e){}
      BOARD.forEach(function(t,i){
        var value=saved[t.n];
        counts[t.n]=(typeof value==="number" && Number.isFinite(value) && value>=0) ? value : DEMO[i];
      });
      if(!saveLocalCounts()) return;
      paintAll(); status("Saved in this browser"); return;
    }
    google.script.run.withSuccessHandler(function(data){
      if(busy()) return;
      counts=data; paintAll(); status("");
    }).withFailureHandler(function(){
      status("Could not load counts. Check your connection.");
    }).getCounts();
  }

  function change(i,d){
    var name=BOARD[i].n, cur=counts[name];
    if(cur===undefined || (d<0 && cur<=0)) return;
    counts[name]=Math.max(0,cur+d);
    pending[name]=(pending[name]||0)+d;
    paint(i,true);
    clearTimeout(timers[name]);
    timers[name]=setTimeout(function(){ flush(name,i); },400);
  }

  function flush(name,i){
    var d=pending[name]||0; pending[name]=0;
    if(!d) return;
    if(!onServer && !APPS_SCRIPT_URL){ if(saveLocalCounts()) status("Saved in this browser"); return; }
    inflight[name]=(inflight[name]||0)+1;
    status(onServer ? "Saving\u2026" : "Saving to Google Sheet\u2026");
    if(!onServer){
      var body=new URLSearchParams();
      body.set("action","changeCount"); body.set("teacher",name); body.set("delta",String(d));
      fetch(APPS_SCRIPT_URL,{method:"POST",mode:"no-cors",body:body})
        .then(function(){
          inflight[name]--;
          if(!pending[name] && !inflight[name]){
            status("Saved to Google Sheet");
            setTimeout(load,900);
          }
        }).catch(function(){
          inflight[name]--;
          status("Could not save to Google Sheet. Check your connection.");
          setTimeout(load,1500);
        });
      return;
    }
    google.script.run.withSuccessHandler(function(v){
      inflight[name]--;
      if(!pending[name] && !inflight[name]){ counts[name]=v; paint(i); }
      if(!busy()) status("Saved");
    }).withFailureHandler(function(){
      inflight[name]--;
      status("Could not save. Check your connection.");
      setTimeout(load,1500);
    }).changeCount(name,d);
  }

  load();
  setInterval(load,20000);
  document.addEventListener("visibilitychange",function(){ if(!document.hidden) load(); });
v