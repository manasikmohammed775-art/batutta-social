import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://itoareabdaofdfyvjdvd.supabase.co',
  'sb_publishable_OlTsulPNb1L4P_Oka1wtkQ_6dJVqEPi'
);
const ORANGE = '#FF6B00';

export default function App(){
  const [screen, setScreen] = useState('onboarding');
  const [step, setStep] = useState(0);
  const [user, setUser] = useState<any>(null);
  // بيانات الملف الكامل
  const [name, setName] = useState(''); const [email, setEmail] = useState('');
  const [phone, setPhone] = useState(''); const [pass, setPass] = useState('');
  const [age, setAge] = useState(''); const [gender, setGender] = useState('');
  const [statusUser, setStatusUser] = useState(''); const [study, setStudy] = useState('');
  const [birth, setBirth] = useState(''); const [city, setCity] = useState('');
  const [bio, setBio] = useState('');
  const [posts, setPosts] = useState<any[]>([]); const [postText, setPostText] = useState('');
  const [chatText, setChatText] = useState(''); 
  const [chats, setChats] = useState([{from:'batutta', text:'أهلا أنا بطوطة الذكية 🦆 بتكلم عربي وانجليزي'}]);

  const onboard = [
    {t:'سياحة 🌍', d:'شارك أماكن السودان الجميلة'},
    {t:'تعليم 🎓', d:'كورسات ونصائح'},
    {t:'عمل 💼', d:'فرص عمل ومشاريع'},
    {t:'علاج 🏥', d:'تجارب واستشارات'},
    {t:'تجارب ودردشات 💬', d:'احكي قصتك واتونس'},
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
  async function post(){ if(!postText) return; await supabase.from('posts').insert({user_id:user.id, content:postText, author_name:name||email}); setPostText(''); loadPosts(); }

  if(screen==='onboarding'){
    return (<View style={styles.center}><Text style={styles.logo}>🦆 batutta</Text><View style={styles.card}><Text style={styles.title}>{onboard[step].t}</Text><Text style={styles.desc}>{onboard[step].d}</Text><TouchableOpacity style={styles.btn} onPress={()=> step<4 ? setStep(step+1) : setScreen('register')}><Text style={styles.btnText}>{step<4?'التالي':'ابدأ'}</Text></TouchableOpacity></View><Text style={{color:'#fff'}}>{step+1}/5</Text></View>);
  }

  if(screen==='register' || screen==='login'){
    return (
      <ScrollView contentContainerStyle={styles.center}>
        <Text style={styles.logo}>batutta</Text>
        <View style={styles.card}>
          <Text style={styles.title}>{screen==='register'?'ملف شخصي كامل':'دخول'}</Text>
          {screen==='register' && (<>
            <TextInput placeholder="الاسم الكامل *" value={name} onChangeText={setName} style={styles.input}/>
            <TextInput placeholder="العمر *" value={age} onChangeText={setAge} style={styles.input} keyboardType="numeric"/>
            <TextInput placeholder="النوع ذكر/أنثى *" value={gender} onChangeText={setGender} style={styles.input}/>
            <TextInput placeholder="الحالة الاجتماعية" value={statusUser} onChangeText={setStatusUser} style={styles.input}/>
            <TextInput placeholder="الدراسة / العمل" value={study} onChangeText={setStudy} style={styles.input}/>
            <TextInput placeholder="تاريخ الميلاد" value={birth} onChangeText={setBirth} style={styles.input}/>
            <TextInput placeholder="المدينة" value={city} onChangeText={setCity} style={styles.input}/>
            <TextInput placeholder="رقم الهاتف / واتساب" value={phone} onChangeText={setPhone} style={styles.input}/>
            <TextInput placeholder="نبذة عنك" value={bio} onChangeText={setBio} style={styles.input}/>
          </>)}
          <TextInput placeholder="الايميل *" value={email} onChangeText={setEmail} style={styles.input}/>
          <TextInput placeholder="كلمة السر *" value={pass} onChangeText={setPass} secureTextEntry style={styles.input}/>
          <TouchableOpacity style={styles.btn} onPress={screen==='register'?registerFull:login}><Text style={styles.btnText}>{screen==='register'?'انشاء حسابي الكامل':'دخول'}</Text></TouchableOpacity>
          <TouchableOpacity onPress={()=>setScreen(screen==='register'?'login':'register')}><Text style={{textAlign:'center', color:ORANGE, marginTop:10}}>{screen==='register'?'عندك حساب؟ دخول':'ما عندك حساب؟ تسجيل'}</Text></TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={{flex:1, backgroundColor:'#fff'}}>
      <View style={styles.header}><Text style={{color:ORANGE, fontWeight:'900', fontSize:20}}>batutta 🦆</Text><Text style={{fontSize:10}}>{user?.email}</Text></View>
      <ScrollView>
        <View style={styles.card}><TextInput placeholder="شنو في بالك؟" value={postText} onChangeText={setPostText} style={styles.input}/><TouchableOpacity style={styles.btn} onPress={post}><Text style={styles.btnText}>نشر</Text></TouchableOpacity></View>
        <View style={[styles.card,{backgroundColor:'#FFF3E8', borderColor:ORANGE, borderWidth:1}]}>
          <Text style={{color:ORANGE, fontWeight:'bold'}}>بطوطة الذكية - عربي وانجليزي + ذكاء اصطناعي</Text>
          {chats.map((m,i)=><View key={i} style={{alignSelf:m.from==='you'?'flex-end':'flex-start', backgroundColor:m.from==='you'?ORANGE:'#fff', padding:8, borderRadius:10, marginTop:5}}><Text style={{color:m.from==='you'?'#fff':'#000'}}>{m.text}</Text></View>)}
          <View style={{flexDirection:'row', marginTop:10}}><TextInput placeholder="احكي مع بطوطة..." value={chatText} onChangeText={setChatText} style={[styles.input,{flex:1}]}/><TouchableOpacity style={styles.btn} onPress={()=>{ if(!chatText) return; setChats([...chats,{from:'you',text:chatText},{from:'batutta',text:`فهمتك: "${chatText}" - رد ذكي من بطوطة 🦆`} ]); setChatText(''); }}><Text style={styles.btnText}>ارسال</Text></TouchableOpacity></View>
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
