import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';

// 1. الأمان: من .env مش من الكود مباشرة
const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_KEY!
);

const ORANGE = '#FF6B00';

// 2. اللغة التلقائية - حسب جهاز المستخدم
const i18n = new I18n({
  en: {
    onboarding1: 'Tourism 🌍', onboarding1d: 'Share beautiful places in Sudan',
    onboarding2: 'Education 🎓', onboarding2d: 'Courses and tips',
    onboarding3: 'Work 💼', onboarding3d: 'Jobs and projects',
    onboarding4: 'Health 🏥', onboarding4d: 'Experiences and advice',
    onboarding5: 'Stories & Chats 💬', onboarding5d: 'Tell your story',
    next: 'Next', start: 'Start', fullName: 'Full Name *', age: 'Age *',
    gender: 'Gender *', email: 'Email *', password: 'Password *',
    createAccount: 'Create My Account', login: 'Login',
    haveAccount: 'Have account? Login', noAccount: 'No account? Register',
    whatsOnMind: "What's on your mind?", publish: 'Post', send: 'Send',
    chatWith: 'Chat with Batutta...', aiTitle: 'Smart Batutta - Arabic & English + AI',
    aiHello: 'Hi, I am Smart Batutta 🦆 I speak Arabic and English',
  },
  ar: {
    onboarding1: 'سياحة 🌍', onboarding1d: 'شارك أماكن السودان الجميلة',
    onboarding2: 'تعليم 🎓', onboarding2d: 'كورسات ونصائح',
    onboarding3: 'عمل 💼', onboarding3d: 'فرص عمل ومشاريع',
    onboarding4: 'علاج 🏥', onboarding4d: 'تجارب واستشارات',
    onboarding5: 'تجارب ودردشات 💬', onboarding5d: 'احكي قصتك واتونس',
    next: 'التالي', start: 'ابدأ', fullName: 'الاسم الكامل *', age: 'العمر *',
    gender: 'النوع ذكر/أنثى *', email: 'الايميل *', password: 'كلمة السر *',
    createAccount: 'انشاء حسابي الكامل', login: 'دخول',
    haveAccount: 'عندك حساب؟ دخول', noAccount: 'ما عندك حساب؟ تسجيل',
    whatsOnMind: 'شنو في بالك؟', publish: 'نشر', send: 'ارسال',
    chatWith: 'احكي مع بطوطة...', aiTitle: 'بطوطة الذكية - عربي وانجليزي + ذكاء اصطناعي',
    aiHello: 'أهلا أنا بطوطة الذكية 🦆 بتكلم عربي وانجليزي',
  },
});
i18n.locale = Localization.getLocales()[0]?.languageCode ?? 'en';
i18n.enableFallback = true;

export default function App(){
  const [screen, setScreen] = useState('onboarding');
  const [step, setStep] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState(''); const [email, setEmail] = useState('');
  const [phone, setPhone] = useState(''); const [pass, setPass] = useState('');
  const [age, setAge] = useState(''); const [gender, setGender] = useState('');
  const [statusUser, setStatusUser] = useState(''); const [study, setStudy] = useState('');
  const [birth, setBirth] = useState(''); const [city, setCity] = useState('');
  const [bio, setBio] = useState('');
  const [posts, setPosts] = useState<any[]>([]); const [postText, setPostText] = useState('');
  const [chatText, setChatText] = useState(''); 
  const [chats, setChats] = useState([{from:'batutta', text: i18n.t('aiHello')}]);

  const onboard = [
    {t: i18n.t('onboarding1'), d: i18n.t('onboarding1d')},
    {t: i18n.t('onboarding2'), d: i18n.t('onboarding2d')},
    {t: i18n.t('onboarding3'), d: i18n.t('onboarding3d')},
    {t: i18n.t('onboarding4'), d: i18n.t('onboarding4d')},
    {t: i18n.t('onboarding5'), d: i18n.t('onboarding5d')},
  ];

  useEffect(()=>{ loadPosts(); },[]);
  async function loadPosts(){ const {data}=await supabase.from('posts').select('*').order('created_at',{ascending:false}); if(data) setPosts(data); }

  async function registerFull(){
    if(!name||!email||!pass||!age||!gender){ Alert.alert('املا الحقول المهمة *'); return; }
    const {data, error}=await supabase.auth.signUp({email, password:pass, options:{data:{full_name:name}}});
    if(error){ Alert.alert(error.message); return; }
    if(data.user){
      await supabase.from('profiles').insert({id:data.user.id, full_name:name, phone, age:parseInt(age), gender, status:statusUser, study, birth_date:birth, city, bio});
      Alert.alert('تم! افتح ايميلك للتأكيد'); setScreen('login');
    }
  }
  async function login(){ const {data, error}=await supabase.auth.signInWithPassword({email, password:pass}); if(error) Alert.alert(error.message); else {setUser(data.user); setScreen('main'); loadPosts();} }
  async function post(){ if(!postText || !user) return; await supabase.from('posts').insert({user_id:user.id, content:postText, author_name:name||email}); setPostText(''); loadPosts(); }

  if(screen==='onboarding'){
    return (<View style={styles.center}><Text style={styles.logo}>Batutta</Text><View style={styles.card}><Text style={styles.title}>{onboard[step].t}</Text><Text style={styles.desc}>{onboard[step].d}</Text><TouchableOpacity style={styles.btn} onPress={()=> step<4 ? setStep(step+1) : setScreen('register')}><Text style={styles.btnText}>{step<4? i18n.t('next') : i18n.t('start')}</Text></TouchableOpacity></View><Text style={{color:'#fff'}}>{step+1}/5</Text></View>);
  }

  if(screen==='register' || screen==='login'){
    return (
      <ScrollView contentContainerStyle={styles.center}>
        {/* الاسم ثابت Batutta - ما بيتغير باللغة */}
        <Text style={styles.logo}>Batutta</Text>
        <View style={styles.card}>
          <Text style={styles.title}>{screen==='register'? i18n.t('createAccount') : i18n.t('login')}</Text>
          {screen==='register' && (<>
            <TextInput placeholder={i18n.t('fullName')} value={name} onChangeText={setName} style={styles.input}/>
            <TextInput placeholder={i18n.t('age')} value={age} onChangeText={setAge} style={styles.input} keyboardType="numeric"/>
            <TextInput placeholder={i18n.t('gender')} value={gender} onChangeText={setGender} style={styles.input}/>
            <TextInput placeholder="الحالة الاجتماعية" value={statusUser} onChangeText={setStatusUser} style={styles.input}/>
            <TextInput placeholder="الدراسة / العمل" value={study} onChangeText={setStudy} style={styles.input}/>
            <TextInput placeholder="تاريخ الميلاد" value={birth} onChangeText={setBirth} style={styles.input}/>
            <TextInput placeholder="المدينة" value={city} onChangeText={setCity} style={styles.input}/>
            <TextInput placeholder="رقم الهاتف / واتساب" value={phone} onChangeText={setPhone} style={styles.input}/>
            <TextInput placeholder="نبذة عنك" value={bio} onChangeText={setBio} style={styles.input}/>
          </>)}
          <TextInput placeholder={i18n.t('email')} value={email} onChangeText={setEmail} style={styles.input} autoCapitalize="none"/>
          <TextInput placeholder={i18n.t('password')} value={pass} onChangeText={setPass} secureTextEntry style={styles.input}/>
          <TouchableOpacity style={styles.btn} onPress={screen==='register'?registerFull:login}><Text style={styles.btnText}>{screen==='register'? i18n.t('createAccount') : i18n.t('login')}</Text></TouchableOpacity>
          <TouchableOpacity onPress={()=>setScreen(screen==='register'?'login':'register')}><Text style={{textAlign:'center', color:ORANGE, marginTop:10}}>{screen==='register'? i18n.t('haveAccount') : i18n.t('noAccount')}</Text></TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={{flex:1, backgroundColor:'#fff'}}>
      <View style={styles.header}><Text style={{color:ORANGE, fontWeight:'900', fontSize:20}}>Batutta 🦆</Text><Text style={{fontSize:10}}>{user?.email}</Text></View>
      <ScrollView>
        <View style={styles.card}><TextInput placeholder={i18n.t('whatsOnMind')} value={postText} onChangeText={setPostText} style={styles.input}/><TouchableOpacity style={styles.btn} onPress={post}><Text style={styles.btnText}>{i18n.t('publish')}</Text></TouchableOpacity></View>
        <View style={[styles.card,{backgroundColor:'#FFF3E8', borderColor:ORANGE, borderWidth:1}]}>
          <Text style={{color:ORANGE, fontWeight:'bold'}}>{i18n.t('aiTitle')}</Text>
          {chats.map((m,i)=><View key={i} style={{alignSelf:m.from==='you'?'flex-end':'flex-start', backgroundColor:m.from==='you'?ORANGE:'#fff', padding:8, borderRadius:10, marginTop:5}}><Text style={{color:m.from==='you'?'#fff':'#000'}}>{m.text}</Text></View>)}
          <View style={{flexDirection:'row', marginTop:10}}><TextInput placeholder={i18n.t('chatWith')} value={chatText} onChangeText={setChatText} style={[styles.input,{flex:1}]}/><TouchableOpacity style={styles.btn} onPress={()=>{ if(!chatText) return; setChats([...chats,{from:'you',text:chatText},{from:'batutta',text:`${chatText}`} ]); setChatText(''); }}><Text style={styles.btnText}>{i18n.t('send')}</Text></TouchableOpacity></View>
        </View>
        {posts.map(p=><View key={p.id} style={styles.card}><Text style={{fontWeight:'bold'}}>{p.author_name}</Text><Text style={{marginTop:5}}>{p.content}</Text><View style={{flexDirection:'row', gap:8, marginTop:10}}><Text>❤️ لايك</Text><Text>💬 تعليق</Text><Text>👥 متابعة</Text><Text>📞 مكالمة</Text><Text>📹 فيديو</Text></View></View>)}
      </ScrollView>
      <View style={styles.tab}><Text style={{color:ORANGE}}>🏠</Text><Text>🔍</Text><Text>🎬</Text><Text>💬</Text><Text>👤</Text></View>
    </View>
  );
}

const styles = StyleSheet.create({
  center:{flexGrow:1, backgroundColor:ORANGE, justifyContent:'center', alignItems:'center', padding:20},
  logo:{fontSize:40, fontWeight:'900', color:'#fff', marginBottom:20},
  card:{backgroundColor:'#fff', borderRadius:16, padding:15, margin:10, width:'95%'},
  title:{fontSize:20, fontWeight:'bold', textAlign:'center', marginBottom:10},
  desc:{textAlign:'center', color:'#555', marginBottom:10},
  input:{backgroundColor:'#f2f2f2', borderRadius:10, padding:12, marginTop:8},
  btn:{backgroundColor:ORANGE, padding:14, borderRadius:12, marginTop:10},
  btnText:{color:'#fff', textAlign:'center', fontWeight:'bold'},
  header:{padding:15, flexDirection:'row', justifyContent:'space-between', borderBottomWidth:1, borderColor:'#eee'},
  tab:{flexDirection:'row', justifyContent:'space-around', padding:12, borderTopWidth:1, borderColor:'#eee'}
});
