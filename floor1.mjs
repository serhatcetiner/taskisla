// Schematic room positions only. No source CAD or PDF is shipped.
export const FLOOR = {
  name: '1. kat', width: 1100, height: 800,
  rooms: [
    {id:'227', x:132,y:45,w:84,h:85},
    {id:'227B',x:89,y:158,w:127,h:42},
    {id:'215',x:894,y:45,w:76,h:85},
    {id:'216',x:976,y:45,w:84,h:85},
    {id:'216A',x:916,y:158,w:60,h:42},
    {id:'216B',x:982,y:158,w:60,h:42},
    {id:'217E',x:342,y:175,w:90,h:37},
    {id:'217F',x:516,y:175,w:90,h:37},
    {id:'217G',x:690,y:175,w:90,h:37},
    {id:'217D',x:280,y:220,w:140,h:54},
    {id:'217C',x:426,y:220,w:140,h:54},
    {id:'217B',x:572,y:220,w:140,h:54},
    {id:'217A',x:718,y:220,w:140,h:54},
    {id:'229',x:112,y:284,w:111,h:111},
    {id:'230',x:112,y:401,w:111,h:90},
    {id:'231',x:112,y:497,w:111,h:111},
    {id:'214',x:900,y:284,w:111,h:111},
    {id:'213',x:900,y:401,w:111,h:90},
    {id:'212',x:900,y:497,w:111,h:111},
    // Three equal schematic areas, as confirmed by the owner. No physical wall implied.
    {id:'203A',x:280,y:574,w:189,h:47},
    {id:'203B',x:475,y:574,w:188,h:47},
    {id:'203C',x:669,y:574,w:189,h:47}
  ],
  excluded: [
    {x:40,y:45,w:86,h:85},
    {x:280,y:78,w:145,h:75},{x:431,y:65,w:80,h:88},
    {x:517,y:45,w:80,h:108},{x:603,y:65,w:80,h:88},
    {x:689,y:78,w:169,h:75},
    {x:40,y:700,w:147,h:70},
    {x:280,y:684,w:220,h:70},{x:506,y:684,w:120,h:70},
    {x:632,y:684,w:226,h:70}
  ],
  facilities: [
    {label:'WC',x:237,y:81,w:35,h:48},
    {label:'WC',x:865,y:81,w:24,h:48},
    {label:'MERDİVEN',x:40,y:232,w:183,h:38},
    {label:'MERDİVEN',x:900,y:232,w:160,h:38},
    {label:'MERDİVEN',x:40,y:616,w:183,h:32},
    {label:'MERDİVEN',x:900,y:616,w:160,h:32},
    {label:'MERDİVEN',x:193,y:704,w:30,h:66,vertical:true},
    {label:'WC',x:865,y:696,w:29,h:34},
    {label:'Kütüphane',x:922,y:700,w:138,h:70}
  ]
};
