const express = require('express');
const cors    = require('cors');

const app  = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

// ── 인메모리 DB ───────────────────────────────────────────────
let nextId = { users:1, semesters:1, courses:1, gaps:1 };
const DB = { schools:[], users:[], interestTags:[], userInterestTags:[], semesters:[], courses:[], gaps:[], recCategories:[], recommendations:[] };

function seed() {
  DB.schools = [
    {id:1,name:'한국대학교',campusName:'서울캠퍼스',latitude:37.5665,longitude:126.9780,region:'서울'},
    {id:2,name:'서울과학기술대학교',campusName:'공릉캠퍼스',latitude:37.6324,longitude:127.0780,region:'서울'},
    {id:3,name:'부산한림대학교',campusName:'해운대캠퍼스',latitude:35.1631,longitude:129.1635,region:'부산'},
    {id:4,name:'대전중앙대학교',campusName:'유성캠퍼스',latitude:36.3504,longitude:127.3845,region:'대전'},
    {id:5,name:'광주미래대학교',campusName:'북구캠퍼스',latitude:35.1595,longitude:126.8526,region:'광주'},
  ];
  DB.interestTags = [
    {id:1,tagName:'카페',category:'식음료',iconEmoji:'☕'},
    {id:2,tagName:'식사',category:'식음료',iconEmoji:'🍱'},
    {id:3,tagName:'공부',category:'학업',iconEmoji:'📚'},
    {id:4,tagName:'운동',category:'건강',iconEmoji:'🏃'},
    {id:5,tagName:'휴식',category:'힐링',iconEmoji:'😴'},
    {id:6,tagName:'친구 만남',category:'소셜',iconEmoji:'👥'},
    {id:7,tagName:'산책',category:'건강',iconEmoji:'🚶'},
    {id:8,tagName:'쇼핑',category:'여가',iconEmoji:'🛍️'},
    {id:9,tagName:'독서',category:'학업',iconEmoji:'📖'},
    {id:10,tagName:'음악 감상',category:'힐링',iconEmoji:'🎵'},
  ];
  DB.recCategories = [
    {id:1,name:'카페',iconEmoji:'☕',colorCode:'#F59E0B',minDuration:30},
    {id:2,name:'식사',iconEmoji:'🍱',colorCode:'#10B981',minDuration:30},
    {id:3,name:'공부',iconEmoji:'📚',colorCode:'#3B82F6',minDuration:20},
    {id:4,name:'운동',iconEmoji:'🏃',colorCode:'#EF4444',minDuration:60},
    {id:5,name:'휴식',iconEmoji:'😴',colorCode:'#8B5CF6',minDuration:10},
    {id:6,name:'친구 만남',iconEmoji:'👥',colorCode:'#EC4899',minDuration:60},
    {id:7,name:'빠른 활동',iconEmoji:'⚡',colorCode:'#6B7280',minDuration:0},
  ];
  const R=(catId,title,desc,estMin,minDur,score,reason,weather,pop,tags)=>({catId,title,desc,estMin,minDur,score,reason,weather,pop,tags});
  DB.recommendations=[
    R(7,'편의점 간식 타임','가까운 편의점에서 간식을 사며 짧게 쉬어가요.',10,0,60,'⚡ 짧은 공강 딱!','ALL',85,'휴식'),
    R(7,'다음 수업 예습하기','강의 자료 5분만 훑어봐도 이해도가 확 달라져요.',20,0,55,'📖 예습 효과 UP','ALL',72,'공부'),
    R(7,'스트레칭 타임','간단한 목·허리 스트레칭으로 리프레시!',10,0,50,'💪 몸이 가벼워요','ALL',68,'운동'),
    R(7,'좋아하는 노래 2곡','이어폰 꽂고 좋아하는 노래 2곡. 기분 전환 완료.',15,0,48,'🎵 기분 UP','ALL',65,'휴식'),
    R(7,'메모 정리하기','수업 중 적은 메모를 빠르게 정리해봐요.',20,0,52,'📝 정리 습관','ALL',62,'공부'),
    R(1,'학교 카페 아메리카노','캠퍼스 카페에서 여유로운 커피 한 잔!',40,30,88,'☕ 카페 관심','ALL',92,'카페'),
    R(1,'카페에서 과제 집중','카페 분위기 속 백색소음이 집중력을 높여줘요.',60,30,82,'📚 공부+카페 조합','INDOOR',88,'카페,공부'),
    R(1,'디저트 카페 탐방','달콤한 디저트로 당 충전. 공부 전 에너지 보충!',45,30,75,'🍰 달달한 휴식','ALL',80,'카페'),
    R(1,'테이크아웃 커피 산책','커피 들고 캠퍼스 한 바퀴!',30,30,70,'🌤️ 맑은 날 추천','OUTDOOR',78,'카페,산책'),
    R(1,'스터디 카페 이용하기','조용한 스터디 카페에서 집중해봐요.',90,30,80,'📖 조용한 집중','INDOOR',82,'카페,공부'),
    R(2,'학식 먹으러 가기','학교 식당에서 든든하게 한 끼!',30,30,90,'🍱 식사 관심','ALL',95,'식사'),
    R(2,'주변 맛집 탐방','학교 근처 숨은 맛집 발견의 기쁨!',50,40,78,'🍜 새로운 맛집','ALL',82,'식사'),
    R(2,'편의점 도시락','빠르고 저렴하게 편의점 도시락으로!',20,30,72,'⚡ 빠른 식사','ALL',80,'식사'),
    R(2,'분식집에서 떡볶이','매콤한 떡볶이로 스트레스 해소!',40,30,80,'🌶️ 매콤하게','ALL',88,'식사'),
    R(2,'친구랑 점심 약속','공강 겹치는 친구랑 점심 먹으며 수다!',60,40,85,'👥 같이 먹자','ALL',90,'식사,친구 만남'),
    R(3,'도서관에서 과제하기','조용한 도서관에서 밀린 과제를 해치워봐요.',60,30,82,'📚 공부 관심','INDOOR',88,'공부'),
    R(3,'강의 복습 정리','방금 들은 수업 내용을 정리하면 기억에 오래 남아요.',40,30,78,'🔁 복습의 힘','ALL',82,'공부'),
    R(3,'유튜브 강의 보기','어려운 개념은 유튜브 강의로 보충해봐요.',30,20,70,'🎥 개념 보충','ALL',75,'공부'),
    R(3,'문제집 풀기','시험 대비 문제집 한 단원씩 꾸준히!',60,30,76,'✏️ 꾸준히','INDOOR',80,'공부'),
    R(3,'팀 과제 회의','팀원들과 공강 시간에 과제 회의!',60,30,80,'👥 팀워크','ALL',85,'공부,친구 만남'),
    R(4,'캠퍼스 산책하기','캠퍼스를 걸으며 머리도 식히고 운동도!',30,60,72,'🌤️ 맑은 날 딱!','OUTDOOR',78,'운동'),
    R(4,'학교 체육관 이용','체육관에서 간단한 운동으로 에너지 충전!',60,60,68,'💪 운동 관심','INDOOR',72,'운동'),
    R(4,'런닝 타임','음악 들으며 캠퍼스 달리기. 상쾌한 기분!',40,60,65,'🏃 달려봐요','OUTDOOR',70,'운동'),
    R(5,'잠깐 눈 붙이기','짧은 낮잠으로 에너지 충전!',20,30,75,'😴 휴식 관심','ALL',85,'휴식'),
    R(5,'유튜브 보기','좋아하는 채널 영상 보며 뇌를 쉬게 해줘요.',40,30,70,'🎬 잠깐 쉬어요','ALL',80,'휴식'),
    R(5,'좋아하는 음악 감상','좋아하는 플레이리스트로 힐링 타임.',30,30,68,'🎵 음악 관심','ALL',78,'휴식,음악 감상'),
    R(5,'소설 또는 웹툰 읽기','재미있는 소설이나 웹툰으로 머리를 비워봐요.',40,30,65,'📖 독서 관심','ALL',75,'휴식,독서'),
    R(6,'친구와 밥 먹기','공강 겹치는 친구 불러서 같이 밥 먹으며 수다!',60,60,88,'👥 친구 만남 관심','ALL',92,'친구 만남,식사'),
    R(6,'친구랑 카페 가기','카페에서 수다 타임. 커피 한 잔의 여유.',60,60,85,'☕ 카페 수다','ALL',90,'친구 만남,카페'),
    R(6,'도서관에서 같이 공부','같이 공부하면 더 집중돼요!',90,60,80,'📚 같이 공부','INDOOR',85,'친구 만남,공부'),
    R(6,'캠퍼스 산책하며 수다','학교 돌아다니며 이야기 나누기.',40,60,78,'🌤️ 산책 수다','OUTDOOR',82,'친구 만남,운동'),
    R(6,'편의점 앞 수다','편의점 앞에서 간식 먹으며 수다!',30,60,72,'🏪 편의점 수다','ALL',78,'친구 만남,식사'),
  ].map((r,i)=>({id:i+1,...r}));
  console.log('✅ 초기 데이터 삽입 완료');
}

// ── 공강 계산 ─────────────────────────────────────────────────
const WEEKDAYS=['MON','TUE','WED','THU','FRI'];
const DAY_LABELS={MON:'월요일',TUE:'화요일',WED:'수요일',THU:'목요일',FRI:'금요일'};
const GAP_DISPLAY={SHORT:'짧은 공강',VALID:'유효 공강',RELAXED:'여유 공강',FREE_DAY:'자유 시간'};
const toMin=t=>{const[h,m]=t.split(':').map(Number);return h*60+m;};
const toTime=m=>`${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;
const classifyGap=m=>m<30?'SHORT':m<60?'VALID':'RELAXED';
const getTodayDay=()=>['SUN','MON','TUE','WED','THU','FRI','SAT'][new Date().getDay()];

function recalcGaps(userId) {
  DB.gaps=DB.gaps.filter(g=>g.userId!==userId);
  const sem=DB.semesters.find(s=>s.userId===userId&&s.isActive);
  if(!sem)return;
  const courses=DB.courses.filter(c=>c.semesterId===sem.id);
  for(const day of WEEKDAYS){
    const dc=courses.filter(c=>c.dayOfWeek===day).sort((a,b)=>toMin(a.startTime)-toMin(b.startTime));
    if(!dc.length){DB.gaps.push({id:nextId.gaps++,userId,dayOfWeek:day,startTime:'09:00',endTime:'21:00',durationMinutes:720,gapType:'FREE_DAY'});continue;}
    let cur=toMin('09:00');
    for(const c of dc){
      const cs=toMin(c.startTime);
      if(cur<cs){const m=cs-cur;if(m>=10)DB.gaps.push({id:nextId.gaps++,userId,dayOfWeek:day,startTime:toTime(cur),endTime:c.startTime,durationMinutes:m,gapType:classifyGap(m)});}
      const ce=toMin(c.endTime);if(ce>cur)cur=ce;
    }
    const de=toMin('21:00');
    if(cur<de){const m=de-cur;if(m>=10)DB.gaps.push({id:nextId.gaps++,userId,dayOfWeek:day,startTime:toTime(cur),endTime:'21:00',durationMinutes:m,gapType:classifyGap(m)});}
  }
}

// ── 응답 헬퍼 ─────────────────────────────────────────────────
const ok=(res,data,msg='성공')=>res.json({success:true,data,message:msg,timestamp:new Date().toISOString()});
const fail=(res,msg,status=400)=>res.status(status).json({success:false,data:null,message:msg,timestamp:new Date().toISOString()});

// ── 라우터 ────────────────────────────────────────────────────
app.get('/api/v1/health',(req,res)=>ok(res,{status:'UP',service:'GongGang Mate API',version:'MVP'}));

// 학교
app.get('/api/v1/schools',(req,res)=>{
  const{q}=req.query;
  ok(res,q?DB.schools.filter(s=>s.name.includes(q)||s.campusName.includes(q)):DB.schools);
});

// 사용자
app.post('/api/v1/users',(req,res)=>{
  const{nickname,schoolId}=req.body;
  if(!nickname)return fail(res,'닉네임을 입력해주세요.');
  const user={id:nextId.users++,nickname,schoolId:schoolId||null,department:null,onboardingCompleted:false};
  DB.users.push(user);ok(res,fmtUser(user));
});
app.get('/api/v1/users/:id',(req,res)=>{
  const u=DB.users.find(u=>u.id===+req.params.id);
  if(!u)return fail(res,'사용자를 찾을 수 없습니다.',404);ok(res,fmtUser(u));
});
app.patch('/api/v1/users/:id/school',(req,res)=>{
  const u=DB.users.find(u=>u.id===+req.params.id);
  if(!u)return fail(res,'사용자를 찾을 수 없습니다.',404);
  u.schoolId=+req.query.schoolId;ok(res,fmtUser(u));
});
app.post('/api/v1/users/:id/onboarding/complete',(req,res)=>{
  const u=DB.users.find(u=>u.id===+req.params.id);
  if(!u)return fail(res,'사용자를 찾을 수 없습니다.',404);
  u.onboardingCompleted=true;ok(res,fmtUser(u),'온보딩이 완료되었습니다.');
});
app.get('/api/v1/users/:id/onboarding-status',(req,res)=>{
  const userId=+req.params.id;
  const u=DB.users.find(u=>u.id===userId);
  if(!u)return fail(res,'사용자를 찾을 수 없습니다.',404);
  const hasInterestTags=DB.userInterestTags.some(t=>t.userId===userId);
  const sem=DB.semesters.find(s=>s.userId===userId&&s.isActive);
  const hasTimetable=sem?DB.courses.some(c=>c.semesterId===sem.id):false;
  ok(res,{onboardingCompleted:u.onboardingCompleted,hasSchool:!!u.schoolId,hasTimetable,hasInterestTags});
});
function fmtUser(u){const s=DB.schools.find(s=>s.id===u.schoolId);return{id:u.id,nickname:u.nickname,schoolId:u.schoolId,schoolName:s?.name||null,department:u.department,onboardingCompleted:u.onboardingCompleted};}

// 관심 태그
app.get('/api/v1/interest-tags',(req,res)=>ok(res,DB.interestTags));
app.post('/api/v1/users/:id/interest-tags',(req,res)=>{
  const userId=+req.params.id;const{tagIds}=req.body;
  if(!tagIds?.length)return fail(res,'태그를 1개 이상 선택해주세요.');
  DB.userInterestTags=DB.userInterestTags.filter(t=>t.userId!==userId);
  tagIds.forEach(tagId=>DB.userInterestTags.push({userId,tagId}));
  ok(res,DB.interestTags.filter(t=>tagIds.includes(t.id)),'관심 태그가 저장되었습니다.');
});
app.get('/api/v1/users/:id/interest-tags',(req,res)=>{
  const userId=+req.params.id;
  const tagIds=DB.userInterestTags.filter(t=>t.userId===userId).map(t=>t.tagId);
  ok(res,DB.interestTags.filter(t=>tagIds.includes(t.id)));
});

// 학기
app.post('/api/v1/users/:id/semesters',(req,res)=>{
  const userId=+req.params.id;const{year,semesterName}=req.body;
  DB.semesters.forEach(s=>{if(s.userId===userId)s.isActive=false;});
  const sem={id:nextId.semesters++,userId,year,semesterName,isActive:true};
  DB.semesters.push(sem);ok(res,fmtSem(sem));
});
app.get('/api/v1/users/:id/semesters',(req,res)=>ok(res,DB.semesters.filter(s=>s.userId===+req.params.id).map(fmtSem)));
app.get('/api/v1/users/:id/semesters/active',(req,res)=>{
  const sem=DB.semesters.find(s=>s.userId===+req.params.id&&s.isActive);
  if(!sem)return fail(res,'활성 학기가 없습니다.',404);ok(res,fmtSem(sem));
});
app.patch('/api/v1/users/:userId/semesters/:semId/activate',(req,res)=>{
  const userId=+req.params.userId;
  DB.semesters.forEach(s=>{if(s.userId===userId)s.isActive=false;});
  const sem=DB.semesters.find(s=>s.id===+req.params.semId);
  if(!sem)return fail(res,'학기를 찾을 수 없습니다.',404);
  sem.isActive=true;ok(res,fmtSem(sem));
});
function fmtSem(s){return{id:s.id,year:s.year,semesterName:s.semesterName,isActive:s.isActive};}

// 과목
app.post('/api/v1/semesters/:semId/courses',(req,res)=>{
  const semId=+req.params.semId;const{name,dayOfWeek,startTime,endTime,classroom,colorCode}=req.body;
  if(!name||!dayOfWeek||!startTime||!endTime)return fail(res,'필수 항목을 입력해주세요.');
  const conflict=DB.courses.find(c=>c.semesterId===semId&&c.dayOfWeek===dayOfWeek&&toMin(c.startTime)<toMin(endTime)&&toMin(c.endTime)>toMin(startTime));
  if(conflict)return fail(res,`${DAY_LABELS[dayOfWeek]||dayOfWeek} ${startTime}~${endTime} 시간에 이미 수업이 있습니다.`,409);
  const course={id:nextId.courses++,semesterId:semId,name,dayOfWeek,startTime,endTime,classroom:classroom||null,colorCode:colorCode||'#3B82F6'};
  DB.courses.push(course);
  const sem=DB.semesters.find(s=>s.id===semId);if(sem)recalcGaps(sem.userId);
  ok(res,fmtCourse(course),'과목이 등록되었습니다.');
});
app.get('/api/v1/semesters/:semId/courses',(req,res)=>{
  const list=DB.courses.filter(c=>c.semesterId===+req.params.semId).sort((a,b)=>WEEKDAYS.indexOf(a.dayOfWeek)-WEEKDAYS.indexOf(b.dayOfWeek)||toMin(a.startTime)-toMin(b.startTime));
  ok(res,list.map(fmtCourse));
});
app.put('/api/v1/courses/:id',(req,res)=>{
  const course=DB.courses.find(c=>c.id===+req.params.id);
  if(!course)return fail(res,'과목을 찾을 수 없습니다.',404);
  const{name,dayOfWeek,startTime,endTime,classroom,colorCode}=req.body;
  const conflict=DB.courses.find(c=>c.semesterId===course.semesterId&&c.dayOfWeek===dayOfWeek&&c.id!==course.id&&toMin(c.startTime)<toMin(endTime)&&toMin(c.endTime)>toMin(startTime));
  if(conflict)return fail(res,`${DAY_LABELS[dayOfWeek]||dayOfWeek} ${startTime}~${endTime} 시간에 이미 수업이 있습니다.`,409);
  Object.assign(course,{name,dayOfWeek,startTime,endTime,classroom:classroom||null,colorCode:colorCode||course.colorCode});
  const sem=DB.semesters.find(s=>s.id===course.semesterId);if(sem)recalcGaps(sem.userId);
  ok(res,fmtCourse(course),'과목이 수정되었습니다.');
});
app.delete('/api/v1/courses/:id',(req,res)=>{
  const idx=DB.courses.findIndex(c=>c.id===+req.params.id);
  if(idx===-1)return fail(res,'과목을 찾을 수 없습니다.',404);
  const[course]=DB.courses.splice(idx,1);
  const sem=DB.semesters.find(s=>s.id===course.semesterId);if(sem)recalcGaps(sem.userId);
  ok(res,null,'과목이 삭제되었습니다.');
});
function fmtCourse(c){return{id:c.id,semesterId:c.semesterId,name:c.name,dayOfWeek:c.dayOfWeek,dayOfWeekDisplay:DAY_LABELS[c.dayOfWeek]||c.dayOfWeek,startTime:c.startTime,endTime:c.endTime,classroom:c.classroom,colorCode:c.colorCode};}

// 공강
app.get('/api/v1/users/:id/gaps/today',(req,res)=>{
  const today=getTodayDay();
  ok(res,DB.gaps.filter(g=>g.userId===+req.params.id&&g.dayOfWeek===today&&g.gapType!=='FREE_DAY').sort((a,b)=>toMin(a.startTime)-toMin(b.startTime)).map(fmtGap));
});
app.get('/api/v1/users/:id/gaps/weekly',(req,res)=>{
  ok(res,DB.gaps.filter(g=>g.userId===+req.params.id).sort((a,b)=>WEEKDAYS.indexOf(a.dayOfWeek)-WEEKDAYS.indexOf(b.dayOfWeek)||toMin(a.startTime)-toMin(b.startTime)).map(fmtGap));
});
app.get('/api/v1/users/:id/gaps/summary',(req,res)=>{
  const userId=+req.params.id;
  const sem=DB.semesters.find(s=>s.userId===userId&&s.isActive);
  const hasTimetable=sem?DB.courses.some(c=>c.semesterId===sem.id):false;
  const today=getTodayDay();
  const todayGaps=DB.gaps.filter(g=>g.userId===userId&&g.dayOfWeek===today&&g.gapType!=='FREE_DAY').sort((a,b)=>toMin(a.startTime)-toMin(b.startTime));
  const nowMin=new Date().getHours()*60+new Date().getMinutes();
  const next=todayGaps.find(g=>toMin(g.startTime)>nowMin);
  const total=todayGaps.reduce((s,g)=>s+g.durationMinutes,0);
  ok(res,{hasTimetable,hasGapToday:todayGaps.length>0,totalGapCount:todayGaps.length,totalGapMinutes:total,nextGapStartTime:next?.startTime||null,nextGapDisplay:next?.startTime||'없음',todayGaps:todayGaps.map(fmtGap)});
});
function fmtGap(g){return{id:g.id,dayOfWeek:g.dayOfWeek,dayOfWeekDisplay:DAY_LABELS[g.dayOfWeek]||g.dayOfWeek,startTime:g.startTime,endTime:g.endTime,durationMinutes:g.durationMinutes,gapType:g.gapType,gapTypeDisplay:GAP_DISPLAY[g.gapType]||g.gapType};}

// 추천
app.get('/api/v1/users/:id/recommendations',(req,res)=>{
  const userId=+req.params.id;const{gapId,category,weather}=req.query;
  const gap=DB.gaps.find(g=>g.id===+gapId&&g.userId===userId);
  if(!gap)return fail(res,'공강을 찾을 수 없습니다.',404);
  const duration=gap.gapType==='SHORT'?29:gap.durationMinutes;
  const userTagIds=DB.userInterestTags.filter(t=>t.userId===userId).map(t=>t.tagId);
  const userTagNames=DB.interestTags.filter(t=>userTagIds.includes(t.id)).map(t=>t.tagName);
  let wc='ALL';if(weather==='RAINY'||weather==='SNOWY')wc='INDOOR';else if(weather==='SUNNY')wc='OUTDOOR';
  let recs=DB.recommendations.filter(r=>{
    if(r.minDur>duration)return false;
    if(r.weather!=='ALL'&&r.weather!==wc)return false;
    if(category&&category!=='전체'){const cat=DB.recCategories.find(c=>c.id===r.catId);if(cat?.name!==category)return false;}
    return true;
  });
  const scored=recs.map(r=>{let score=r.score;if(r.tags){const rt=r.tags.split(',').map(t=>t.trim());if(rt.some(t=>userTagNames.includes(t)))score+=30;}return{...r,finalScore:score};}).sort((a,b)=>b.finalScore-a.finalScore);
  ok(res,scored.map(r=>fmtRec(r,r.finalScore)));
});
app.get('/api/v1/recommendations/popular',(req,res)=>{
  ok(res,[...DB.recommendations].sort((a,b)=>b.pop-a.pop).slice(0,6).map(r=>fmtRec(r,r.score)));
});
function fmtRec(r,score){const cat=DB.recCategories.find(c=>c.id===r.catId)||{};return{id:r.id,categoryName:cat.name,categoryIcon:cat.iconEmoji,categoryColor:cat.colorCode,title:r.title,description:r.desc,estimatedMinutes:r.estMin,reasonText:r.reason,weatherCondition:r.weather,score,popularity:r.pop};}

seed();
app.listen(PORT,()=>{console.log(`\n🎓 공강메이트 백엔드 서버 실행 중\n📡 http://localhost:${PORT}/api/v1/health\n`);});
