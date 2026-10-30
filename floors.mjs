import {FLOOR as FIRST} from './floor1.mjs';

export const GROUND={
  id:'zemin',name:'Zemin kat',width:1100,height:800,
  rooms:[
    {id:'123A',x:280,y:220,w:54,h:54},{id:'123B',x:340,y:220,w:62,h:54},
    {id:'119A',x:408,y:220,w:83,h:54},{id:'119B',x:497,y:220,w:58,h:54},
    {id:'115',x:597,y:220,w:81,h:54},{id:'114',x:684,y:220,w:174,h:54},
    {id:'126',x:112,y:284,w:111,h:111},{id:'127',x:112,y:497,w:111,h:111},
    {id:'BIM1',x:900,y:284,w:111,h:125},{id:'BIM2',x:900,y:415,w:111,h:86},
    {id:'109',x:900,y:507,w:111,h:101},
    {id:'131',x:280,y:574,w:48,h:47},{id:'134',x:334,y:574,w:92,h:47},
    {id:'136A',x:432,y:574,w:52,h:47},{id:'136B',x:490,y:574,w:52,h:47},
    {id:'106',x:916,y:700,w:69,h:70},{id:'107',x:991,y:700,w:69,h:70}
  ],
  excluded:[
    {x:280,y:78,w:145,h:75},{x:431,y:65,w:80,h:88},{x:517,y:45,w:80,h:108},
    {x:603,y:65,w:80,h:88},{x:689,y:78,w:169,h:75},
    {x:112,y:401,w:111,h:90},{x:40,y:700,w:147,h:70},
    {x:280,y:684,w:220,h:70},{x:554,y:710,w:22,h:44},{x:610,y:710,w:22,h:44},
    {x:638,y:684,w:220,h:70}
  ],
  facilities:[
    {label:'YEMEKHANE',x:40,y:45,w:176,h:85},
    {label:'KANTİN',x:40,y:145,w:176,h:70},
    {label:'KÜTÜPHANE',x:900,y:45,w:160,h:85},
    {label:'KAFE',x:900,y:145,w:160,h:70},
    {label:'WC',x:237,y:81,w:35,h:48},{label:'WC',x:865,y:81,w:24,h:48},
    {label:'MERDİVEN',x:40,y:232,w:183,h:38},{label:'MERDİVEN',x:900,y:232,w:160,h:38},
    {label:'MERDİVEN',x:40,y:616,w:183,h:32},{label:'MERDİVEN',x:900,y:616,w:160,h:32},
    {label:'MERDİVEN',x:193,y:704,w:30,h:66,vertical:true},
    {label:'WC',x:865,y:696,w:29,h:34},
    {label:'SERGİ SALONU',x:638,y:574,w:220,h:47}
  ],
  entrance:true
};

export const ROOF={
  id:'cati',name:'Çatı katı',width:1100,height:800,
  rooms:[
    {id:'3400',x:275,y:82,w:583,h:70},
    ...['3407','3406','3405','3404','3403','3402','3401'].map((id,i)=>({id,x:275+i*84,y:180,w:78,h:47})),
    {id:'D380',label:'380',x:133,y:180,w:57,h:47},
    ...['3501','3502','3503','3504','3505','3506'].map((id,i)=>({id,x:177,y:267+i*48,w:55,h:42})),
    {id:'333',x:916,y:385,w:70,h:70},
    ...['301','302','303','305','307','309','311','313','315','317','319','320'].map((id,i)=>({id,x:275+i*49,y:580,w:43,h:42})),
    ...['CATI6','CATI5','CATI4','CATI3','CATI2','CATI1'].map((id,i)=>({id,label:'ÇATI '+id.slice(-1),x:275+i*98,y:677,w:92,h:77})),
    {id:'SER-ATELYE',x:40,y:580,w:150,h:42,small:true}
  ],
  excluded:[
    {x:40,y:44,w:67,h:183},{x:237,y:114,w:29,h:38},
    {x:1000,y:44,w:60,h:183},{x:865,y:114,w:24,h:38},{x:936,y:180,w:57,h:47},
    {x:112,y:267,w:46,h:282},{x:879,y:267,w:28,h:282},
    {x:916,y:267,w:70,h:64},{x:916,y:337,w:70,h:42},
    {x:916,y:461,w:70,h:42},{x:916,y:509,w:70,h:40},{x:935,y:555,w:51,h:18},
    {x:40,y:630,w:67,h:124},{x:112,y:760,w:150,h:17},
    {x:936,y:580,w:57,h:42},{x:1000,y:630,w:60,h:124}
  ],
  facilities:[
    {label:'MERDİVEN',x:200,y:44,w:62,h:33},
    {label:'MERDİVEN',x:865,y:44,w:62,h:33},
    {label:'İÇ BOŞLUK',x:113,y:114,w:71,h:60},
    {label:'İÇ BOŞLUK',x:936,y:114,w:57,h:60},
    {label:'WC',x:200,y:180,w:38,h:47},{label:'WC',x:865,y:180,w:63,h:47},
    {label:'TERAS',x:275,y:44,w:583,h:26},
    {label:'TERAS',x:250,y:250,w:15,h:310,vertical:true},
    {label:'TERAS',x:865,y:250,w:9,h:310,vertical:true},
    {label:'TERAS',x:275,y:555,w:583,h:17},
    {label:'WC',x:200,y:580,w:38,h:42},{label:'WC',x:880,y:580,w:48,h:42},
    {label:'İÇ BOŞLUK',x:113,y:630,w:71,h:70},
    {label:'İÇ BOŞLUK',x:936,y:630,w:57,h:70},
    {label:'MERDİVEN',x:200,y:729,w:62,h:25},{label:'KANTİN',x:865,y:718,w:63,h:36}
  ]
};
export const FLOORS=[GROUND,{...FIRST,id:'birinci'},ROOF];
