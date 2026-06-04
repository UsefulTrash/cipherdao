import { useState } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
const ADDR = import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`;
const ACCENT = "#6366f1";
const ABI = [
  { name:"propose", type:"function", stateMutability:"nonpayable", inputs:[{name:"title",type:"string"},{name:"desc",type:"string"},{name:"duration",type:"uint256"}], outputs:[{type:"uint256"}] },
  { name:"vote", type:"function", stateMutability:"nonpayable", inputs:[{name:"id",type:"uint256"},{name:"yes",type:"bool"}], outputs:[] },
  { name:"execute", type:"function", stateMutability:"nonpayable", inputs:[{name:"id",type:"uint256"}], outputs:[] },
  { name:"getProposal", type:"function", stateMutability:"view", inputs:[{name:"id",type:"uint256"}], outputs:[{type:"tuple",components:[{name:"title",type:"string"},{name:"desc",type:"string"},{name:"yesVotes",type:"uint256"},{name:"noVotes",type:"uint256"},{name:"endAt",type:"uint256"},{name:"executed",type:"bool"}]}] },
  { name:"totalProposals", type:"function", stateMutability:"view", inputs:[], outputs:[{type:"uint256"}] },
  { name:"voted", type:"function", stateMutability:"view", inputs:[{name:"id",type:"uint256"},{name:"addr",type:"address"}], outputs:[{type:"bool"}] },
] as const;
const s: Record<string,React.CSSProperties> = {
  page:{minHeight:"100vh",background:"#080b14",color:"#e2e8f0",fontFamily:"Inter,sans-serif",padding:"24px"},
  header:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:32},
  title:{fontSize:24,fontWeight:700,color:ACCENT},
  tabs:{display:"flex",gap:8,marginBottom:24},
  tab:(a:boolean)=>({padding:"8px 20px",borderRadius:8,border:"none",cursor:"pointer",background:a?ACCENT:"#1e2533",color:a?"#000":"#94a3b8",fontWeight:600}),
  card:{background:"#111827",borderRadius:12,padding:20,marginBottom:16,border:"1px solid #1e2533"},
  label:{display:"block",fontSize:13,color:"#94a3b8",marginBottom:6},
  input:{width:"100%",background:"#1e2533",border:"1px solid #374151",borderRadius:8,padding:"10px 14px",color:"#e2e8f0",fontSize:14,boxSizing:"border-box" as const,marginBottom:14},
  btn:{background:ACCENT,color:"#000",border:"none",borderRadius:8,padding:"10px 20px",fontWeight:700,cursor:"pointer",fontSize:14,marginRight:8},
};
type Proposal={title:string;desc:string;yesVotes:bigint;noVotes:bigint;endAt:bigint;executed:boolean};
function ProposalCard({id}:{id:bigint}){
  const {address}=useAccount();
  const {data}=useReadContract({address:ADDR,abi:ABI,functionName:"getProposal",args:[id]});
  const {data:hasVoted}=useReadContract({address:ADDR,abi:ABI,functionName:"voted",args:[id,address!],query:{enabled:!!address}});
  const {writeContract,data:hash,isPending}=useWriteContract();
  const {isLoading}=useWaitForTransactionReceipt({hash});
  if(!data)return null;
  const p=data as Proposal;
  const ended=Date.now()/1000>=Number(p.endAt);
  return(
    <div style={s.card}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
        <span style={{fontWeight:700}}>🏛️ {p.title}</span>
        <span style={{fontSize:11,padding:"2px 8px",borderRadius:12,background:p.executed?"#1e2533":ended?ACCENT+"22":"#15803d22",color:p.executed?"#64748b":ended?ACCENT:"#4ade80"}}>{p.executed?"Executed":ended?"Ended":"Active"}</span>
      </div>
      <div style={{fontSize:13,color:"#94a3b8",marginBottom:10}}>{p.desc}</div>
      <div style={{display:"flex",gap:16,marginBottom:10}}>
        <span style={{fontSize:13}}>✅ {p.yesVotes.toString()}</span>
        <span style={{fontSize:13}}>❌ {p.noVotes.toString()}</span>
      </div>
      {!ended&&!hasVoted&&(<div style={{display:"flex",gap:8}}>
        <button style={{...s.btn,fontSize:12,padding:"6px 14px",opacity:isPending||isLoading?0.6:1}} onClick={()=>writeContract({address:ADDR,abi:ABI,functionName:"vote",args:[id,true]})} disabled={isPending||isLoading}>Vote Yes</button>
        <button style={{...s.btn,fontSize:12,padding:"6px 14px",background:"#374151",color:"#e2e8f0",opacity:isPending||isLoading?0.6:1}} onClick={()=>writeContract({address:ADDR,abi:ABI,functionName:"vote",args:[id,false]})} disabled={isPending||isLoading}>Vote No</button>
      </div>)}
      {ended&&!p.executed&&<button style={{...s.btn,fontSize:12,padding:"6px 14px"}} onClick={()=>writeContract({address:ADDR,abi:ABI,functionName:"execute",args:[id]})}>Execute</button>}
    </div>
  );
}
export default function App(){
  const {isConnected}=useAccount();
  const [tab,setTab]=useState<"browse"|"create">("browse");
  const [form,setForm]=useState({title:"",desc:"",duration:"86400"});
  const {writeContract,data:hash,isPending}=useWriteContract();
  const {isLoading:confirming}=useWaitForTransactionReceipt({hash});
  const {data:total}=useReadContract({address:ADDR,abi:ABI,functionName:"totalProposals"});
  const ids=total?Array.from({length:Number(total)},(_,i)=>BigInt(i)):[];
  return(
    <div style={s.page}>
      <div style={s.header}><div><div style={s.title}>🏛️ CipherDAO</div><div style={{fontSize:13,color:"#64748b"}}>On-chain DAO governance • {total?.toString()??0} proposals</div></div><ConnectButton/></div>
      {!isConnected?<div style={{textAlign:"center",padding:60,color:"#64748b"}}>Connect wallet to participate</div>:(
        <><div style={s.tabs}><button style={s.tab(tab==="browse")} onClick={()=>setTab("browse")}>Proposals</button><button style={s.tab(tab==="create")} onClick={()=>setTab("create")}>Create</button></div>
        {tab==="browse"&&<div>{ids.length?[...ids].reverse().map(id=><ProposalCard key={id.toString()} id={id}/>):<div style={{color:"#64748b",padding:20}}>No proposals yet</div>}</div>}
        {tab==="create"&&<div style={s.card}>
          <div style={{fontWeight:700,marginBottom:16}}>New Proposal</div>
          <label style={s.label}>Title</label><input style={s.input} value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Proposal title..."/>
          <label style={s.label}>Description</label><input style={s.input} value={form.desc} onChange={e=>setForm({...form,desc:e.target.value})} placeholder="Describe your proposal..."/>
          <label style={s.label}>Duration (seconds)</label><input type="number" style={s.input} value={form.duration} onChange={e=>setForm({...form,duration:e.target.value})}/>
          <button style={{...s.btn,opacity:(isPending||confirming)?0.6:1}} onClick={()=>writeContract({address:ADDR,abi:ABI,functionName:"propose",args:[form.title,form.desc,BigInt(form.duration)]})} disabled={isPending||confirming}>{isPending||confirming?"Submitting...":"Submit Proposal 🏛️"}</button>
        </div>}</>
      )}
    </div>
  );
}