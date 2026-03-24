"use client";

interface PillRowProps {
  topText: string;
  bottomTextLeft: string;
  bottomTextRight: string;
  topColor: string;
  bottomColor: string;
}

const PillRow = ({ topText, bottomTextLeft, bottomTextRight, topColor, bottomColor }: PillRowProps) => (
  <div className="flex flex-col items-start font-sans font-bold uppercase tracking-tighter mx-4">
    {/* ส่วนบน */}
    <div 
      className="inline-block rounded-t-lg px-8 py-1 text-fit" 
      style={{ backgroundColor: topColor }}
    >
      {topText}
    </div>
    {/* ส่วนล่าง */}
    <div className="flex mt-[-2px]"> {/* ดึงขึ้นเล็กน้อยให้ดูชิดกัน */}
      <div className="rounded-full bg-black px-8 py-2 text-fit text-white z-10 flex items-center justify-center">
        {bottomTextLeft}
      </div>
      <div 
        className="rounded-r-full px-8 py-2 text-4xl ml-[-20px] pl-10" 
        style={{ backgroundColor: bottomColor }}
      >
        {bottomTextRight}
      </div>
    </div>
  </div>
);

export default function BarcelonaMultilingual() {
  return (
    <div className="flex flex-col items-center justify-center gap-12 bg-[#e5e5e5] p-10 w-full h-full">
      
      {/* ชุดสีเหลือง */}
      <PillRow 
        topText="Barcelona" 
        bottomTextLeft="Amb" 
        bottomTextRight="Tu" 
        topColor="#f3e681" 
        bottomColor="#f3e681" 
      />

      {/* ชุดสีฟ้า */}
      <PillRow 
        topText="Barcelona" 
        bottomTextLeft="With" 
        bottomTextRight="You" 
        topColor="#b5c6f1" 
        bottomColor="#b5c6f1" 
      />

      {/* ชุดสีเขียว */}
      <PillRow 
        topText="Barcelona" 
        bottomTextLeft="Contigo" 
        bottomTextRight="" 
        topColor="#7ee3a2" 
        bottomColor="transparent" 
      />

    </div>
  );
}