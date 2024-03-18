import React from "react";
import {useState} from "react";
import {OutputGraph, OutputTable, OutputTableRegress, OutputGraphRegress, fileFormats, DataDownload} from './main_pages/output_graph.js';
import {Antoine_P_T, Antoine_T_P, CC_P_T, CC_T_P, substances, models, roundQuantity} from './main_pages/physical_models.js';

const CN = 0, EN = 1;
const model_pic_dir = './assets/';

const applist = { "CalculatingPT": { name_cn: '理论计算沸点或饱和蒸汽压',
                                    name_en: 'Calculating B.P. or P_sat',
                                    abbr: 'CalculatingPT',
                                  },
                  "RegressingHv":  { name_cn: "压力沸点数据回归汽化焓",
                                   name_en: "Regressing H_vap from PT data",
                                   abbr: 'RegressingHv'},
                }


function GraphicPageTitle({onClickLangFuncs,lang, selectApp}) {
  const title_en = "Exploring Correlations btw Pressure and Temperature of a VLE system";
  const title_cn = "单组分气液相平衡的压力-温度关系探究";
  const title = (lang===CN)? title_cn:title_en;
  //const applist_use = [applist.ContactAngle, applist.PlaceHolderApp, applist.PlaceHolderApp];

  const applist_use = [applist.CalculatingPT, applist.RegressingHv];
  const subApp = selectApp[0], setSubApp = selectApp[1];

  const handleSelectApp = (e) => {
    const newApp = e.target.value;
    console.log('newAPPchanged');
    setSubApp(newApp);

  }

  return (
    <div>
      
    <tr class='tr1'>
      <td width='940px'> <h1b>  {title} </h1b> </td> 
      <td width='60px' align="right"><lang> <div class="highlight_shift" onClick={onClickLangFuncs[0]}>简体中文</div>
                                             <div class="highlight_shift" onClick={onClickLangFuncs[1]}>English</div></lang></td>
    </tr>

    <tr>
        <select class='dropdownBox1' value={subApp} onChange={handleSelectApp}>
          {
            applist_use.map((app0)=>{
              const name = (lang===CN) ? app0.name_cn : app0.name_en;
              const abbr = app0.abbr;
              return (<option value={abbr}>{name} </option>)
            })

          }

        </select>

    </tr>

    </div>
  )
}

function FootNote({lang}) {

  const footnote_cn = 'Copyright © 2024 浙江大学 化学系 版权所有';
  const footnote_en = "Copyright © 2024 Department of Chemistry, Zhejiang University";

  const declare_cn = '本应用程序只能用于非盈利的教学目的'
  const declare_en = 'For non-profitable educational purpose only'

  const footnote = (lang===CN)? footnote_cn:footnote_en;
  const declare = (lang===CN)? declare_cn:declare_en;

  return (
    <tr>
      {declare}
      <br/>
      {footnote}
    </tr>

  )

}


function CalculatingPT({lang}) {
  const model_list = ['Antoine','CC'];
  const substance_list = ['Water','Ethanol', 'Chexane', 'Benzene', 'CCl4'];
  const FileFormatList = ['csvfile','txtdata'];
  const [selectedModel, setSelectedModel] = useState('Antoine');
  const [selectedSubstance, setSelectedSubstance] = useState('Water');
  const [TP_data, setTP_data] = useState([]);
  const [selectedFileFormat, setSelectedFormat] = useState('csvfile');

  const select_model_cap_cn = "请选择一个理论计算模型", select_model_cap_en = "Select a model for P-T correlation";
  const select_model_cap = (lang===CN) ? select_model_cap_cn : select_model_cap_en;

  const select_substance_cap_cn = "请选择一个纯物质", select_substance_cap_en = "Select a pure substance to explore";
  const select_substance_cap = (lang===CN) ? select_substance_cap_cn : select_substance_cap_en;

  const press_cap_cn = '输入气压', press_cap_en = 'Input Total Pressure';
  const press_cap = (lang===CN) ? press_cap_cn : press_cap_en;
  const press_unit_cn = 'atm', press_unit_en = 'atm';
  const press_unit = (lang===CN) ? press_unit_cn : press_unit_en;
  const calculateT_en = 'Get Boiling Point', calculateT_cn = '计算沸点';
  const calculateT = (lang===CN) ? calculateT_cn : calculateT_en;

  const temp_cap_cn = '输入温度', temp_cap_en = 'Input Temperature';
  const temp_cap = (lang===CN) ? temp_cap_cn : temp_cap_en;
  const calculateP_en = 'Get Sat. Pressure', calculateP_cn = '计算饱和蒸汽压';
  const calculateP = (lang===CN) ? calculateP_cn : calculateP_en;
  const clear_data_cn='清除计算结果', clear_data_en = 'Clear All results';
  const clear_data = (lang===CN) ? clear_data_cn:clear_data_en;
  const exportData_cn='导出计算结果', exportData_en='Export results';
  const exportData_cap = (lang===CN) ? exportData_cn:exportData_en;
  const download_but_cn='导出...', download_but_en='Export...';
  const download_but_cap = (lang===CN) ? download_but_cn:download_but_en;


  const [P_in, setP_in] = useState('[0.01-3.0]');
  const [T_out, setT_out] = useState('');
  const [T_in, setT_in] = useState('[5-100]');
  const [P_out, setP_out] = useState('');

  const onSelectModel = (e)=>{
    const newModel = e.target.value;
    setSelectedModel(newModel);
  }

  const onSelectSubstance = (e)=>{
    const newSub = e.target.value;
    setSelectedSubstance(newSub);
  } 

  const P_in_Change = (e)=>{
    const newP = e.target.value;
    setP_in(newP);
  } 

  const T_in_Change = (e)=>{
    const newT = e.target.value;
    setT_in(newT);
  } 

  const onSelectedFormat = (e)=>{
    const newFormat = e.target.value;
    setSelectedFormat(newFormat);
  }

  const handleCalculateT = ()=>{
    const alert_info = 'Please input correct pressure';
    const {A,B,C} = substances[selectedSubstance].antoine_params;
    const {P0,T0,dHvap} = substances[selectedSubstance].CC_params;
    const model_sub = models[selectedModel].abbr + '-' + substances[selectedSubstance].abbr
    const color = substances[selectedSubstance].color, point = models[selectedModel].point;
    
    let Pn = parseFloat(P_in);
    if (isNaN(Pn)) {alert(alert_info); return};
    if (Pn<0.05) Pn=0.05; if (Pn>3.0) Pn=3.0;
    const Pn_bar = Pn * 1.01325;
    const T_out_K = selectedModel==='Antoine' ? Antoine_P_T(Pn_bar,A,B,C) : CC_P_T(Pn_bar,P0,T0,dHvap);
    const T_out_C = T_out_K - 273.15;
  
    setT_out(T_out_C); setP_in(Pn);
    setTP_data(prevTP => [...prevTP, [T_out_C,Pn, model_sub,color, point]]);
    
  }

  const handleCalculateP = ()=>{
    const alert_info = 'Please input correct temperature';
    const {A,B,C} = substances[selectedSubstance].antoine_params;
    const {P0,T0,dHvap} = substances[selectedSubstance].CC_params;
    const model_sub = models[selectedModel].abbr + '-' + substances[selectedSubstance].abbr
    const color = substances[selectedSubstance].color, point = models[selectedModel].point;
 
    let Tn = parseFloat(T_in);
    if (isNaN(Tn)) {alert(alert_info);return};
    if (Tn<5.0) Tn=5.0; if (Tn>100) Tn=100.0;
    const Tn_K = Tn + 273.15;
    const P_out_bar = selectedModel==='Antoine' ? Antoine_T_P(Tn_K,A,B,C) : CC_T_P(Tn_K,P0,T0,dHvap);
    const P_out_atm = P_out_bar/1.01325;
  
    setP_out(P_out_atm); setT_in(Tn);
    setTP_data(prevTP => [...prevTP, [Tn,P_out_atm, model_sub,color, point]]);
    
  }

  const handleClearData = ()=>{
    setTP_data([]);
   
  }



  return (
    <table>
      <tr>  {/* first line*/}
        <td width='250px'>

          {select_model_cap}<br/>

          {
            model_list.map((m0)=>{ 
                const model_name = (lang===CN)?models[m0].name_cn:models[m0].name_en;
                const model_abbr = models[m0].abbr;
                return (
                  <div>
                    <input type="radio" name="model" value={model_abbr} 
                      checked={model_abbr===selectedModel} onClick={onSelectModel}/> {model_name}
                  </div>
            )
            })
          }

        </td>

        <td width='450px' align="center">
          <img src={model_pic_dir + selectedModel + '_model.png'} width='262px' height='88px' alt='model'/>

        </td>

        <td width='300px'>
          {select_substance_cap} <br/>
          {
            substance_list.map((s0)=>{ 
                const substance_name = (lang===CN)?substances[s0].name_cn:substances[s0].name_en;
                const substance_abbr = substances[s0].abbr;
                return (
                  <div>
                    <input type="radio" name="substance" value={substance_abbr} 
                    checked={(substance_abbr===selectedSubstance)?true:false} onClick={onSelectSubstance}/> {substance_name}
                  </div>
            )
            })
          }
        </td>        

      </tr>

      <tr>     <td/>  <td> <br/><hr/><br/> </td> <td/>     </tr> {/* a separator line*/}

      <tr> {/* second line*/}
        <td width='250px'>  
          <tr>
              {press_cap} <br/> <input type="number" placeholder='[0.05-3.0]' class='inputBox1' value={P_in} onChange={P_in_Change}/> {' '+press_unit}
              <br/>
              <button onClick={handleCalculateT}>{calculateT}</button> &nbsp;
              <input class='inputBox2' value={roundQuantity(T_out,2)} readonly="true"/> &nbsp; <sup>o</sup>C

          </tr>
          <tr>
              <br/>  <br/>
              {temp_cap} <br/> <input type="number" placeholder='[5-100]' class='inputBox1' value={T_in} onChange={T_in_Change}/> &nbsp; <sup>o</sup>C
              <br/>

              <button onClick={handleCalculateP}>{calculateP}</button> &nbsp;

              <input class='inputBox2' value={roundQuantity(P_out,4)} readonly="true"/> {' '+press_unit}

          </tr>

          <tr>
            <br/> <br/>
            <button onClick={handleClearData}>{clear_data}</button><br/>
          </tr>

        </td>   

        <td width='450px' align="center">
          
          <OutputGraph data={TP_data} lang={lang}/>

          <tr align='left'>
            <br/>{exportData_cap}  <DataDownload data={TP_data} prompt={download_but_cap} fileType={selectedFileFormat} lang={lang}/>
            {
              FileFormatList.map((s0)=>{ 
                  const format_name = (lang===CN)?fileFormats[s0].name_cn:fileFormats[s0].name_en;
                  const format_abbr = fileFormats[s0].abbr;
                  return (
                    <div>
                      <input type="radio" name="fileFormat" value={format_abbr} 
                      checked={(format_abbr===selectedFileFormat)?true:false} onClick={onSelectedFormat}/> {format_name}
                    </div>
              )
              })
            }
            <br/>
          
          </tr>


        </td>
        <td width='300px'>
          <OutputTable data={TP_data} lang={lang}/>

        </td> 
      </tr>

    </table>
  );
}


function RegressingHv({lang}) {

  const alert_info = 'Please input correct pressure and/or temperature';
  const [TP_data, setTP_data] = useState([]);
  const [Pr, setPr] = useState('');
  const [Tr, setTr] = useState('');
  const [slope, setSlope] = useState(0);
  const [intercept, setIntercept] = useState(0);
  
  const press_cap_cn = '输入气压', press_cap_en = 'Input Total Pressure';
  const press_cap = (lang===CN) ? press_cap_cn : press_cap_en;

  const temp_cap_cn = '输入沸点', temp_cap_en = 'Input Boiling Point';
  const temp_cap = (lang===CN) ? temp_cap_cn : temp_cap_en;
  
  const addData_cn = '添加数据点', addData_en = 'Add this data point';
  const addData_cap = (lang===CN) ? addData_cn : addData_en; 

  const clear_data_cn='清除输入数据点', clear_data_en = 'Clear All data points';
  const clear_data = (lang===CN) ? clear_data_cn:clear_data_en;

  const regress_data_cn='回归数据', regress_data_en = 'Regress data points';
  const regress_data_cap = (lang===CN) ? regress_data_cn:regress_data_en;

  const fromFile_cn = '从数据文件添加' , fromFile_en = 'You may also upload csv data';
  const fromFile_cap = (lang===CN) ? fromFile_cn:fromFile_en;
  const fromFileNote_cn = '多行文本，每行是 {压力,温度}' , fromFileNote_en = 'Each line is {Pressure,Temp}';
  const fromFileNote_cap = (lang===CN) ? fromFileNote_cn:fromFileNote_en;


  const PrChange = (e)=>{
    const newP = e.target.value;
    setPr(newP);
  } 

  const TrChange = (e)=>{
    const newT = e.target.value;
    setTr(newT);
  } 

  const handleAddData = ()=> {
    const Tn = parseFloat(Tr), Pn = parseFloat(Pr);
    if (isNaN(Tn) || isNaN(Pn)) alert(alert_info);
    else {
      const T_1 = 1./(Tn+273.15), lnP = Math.log(Pn*1.013);
      setTP_data(prevTP => [...prevTP, [Tn,Pn, T_1,lnP]]);

    }

  }

  const handleDataLoaded = (rawText) => {
    // Example: Convert raw text into an array of objects or any format your plotting library needs
    const parsedData = rawText.split('\n').map(line => {
      const [y, x] = line.split(',').map(Number);
      return [ x, y, 1.0/(x+273.15), Math.log(y*1.013)];
    });
    setTP_data(prevTP => [...prevTP, ...parsedData]);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      // Process the text data here and then pass it to the parent component or store it in state
      handleDataLoaded(text);
    };
    reader.readAsText(file);
  };


  const handleClearData = ()=>{
    setTP_data([]);
    setSlope(0); setIntercept(0);
   
  }

  const regressData = ()=>{

    const alert_info = "Please provide at least 2 data points for regression!";
    const n = TP_data.length;
    if (n<2) alert(alert_info);
    else {
      const data = TP_data.map(row => [row[2], row[3]]);
      const sumX = data.reduce((acc, [x, _]) => acc + x, 0);
      const sumY = data.reduce((acc, [_, y]) => acc + y, 0);
      const sumXY = data.reduce((acc, [x, y]) => acc + x * y, 0);
      const sumX2 = data.reduce((acc, [x, _]) => acc + x * x, 0);
      const slope1 = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      const intercept1 = (sumY - slope1 * sumX) / n;
  
      setSlope(slope1); setIntercept(intercept1);

    }

  }
  

  return (<div>
    <tr>
    This is regression app.<br/>
    </tr>

    <tr>
      <td width='250px'>
        {press_cap} <br/> <input type="number" placeholder='' class='inputBox1' value={Pr} onChange={PrChange}/>&nbsp;  atm
                <br/>

      {temp_cap} <br/> <input type="number" placeholder='' class='inputBox1' value={Tr} onChange={TrChange}/> &nbsp; <sup>o</sup>C
      <br/>

      <button onClick={handleAddData}>{addData_cap}</button> &nbsp;


      <br/><br/>

      {fromFile_cap}<br/>
      {fromFileNote_cap}<br/>

      <input type="file" onChange={handleFileChange}/>

      
      
      <br/><br/>

      <button onClick={handleClearData}>{clear_data}</button><br/>

      <br/>

      <button onClick={regressData}>{regress_data_cap}</button><br/><br/>
      Vaporation Enthalpy <br/><input class='inputBox2' value={roundQuantity(-slope*8.314*0.001,2)} readonly="true"/> &nbsp; kJ/mol
      <br/>Boiling Point at 1 bar: <br/><input class='inputBox2' value={roundQuantity(-slope/intercept-273.15,2)} readonly="true"/> &nbsp; <sup>o</sup>C


      </td>




      <td width='450px'>
        <OutputGraphRegress data={TP_data} reg_params={{slope:slope, intercept:intercept}} lang={lang}/>
        
      </td>

      <td width='300px'>
       <OutputTableRegress data={TP_data} lang={lang}/>
        

      </td>


    </tr>



    </div>);
}

export default function PressTemp(){

  const [subApp, setSubApp] = useState('CalculatingPT');
  //const [subApp, setSubApp] = useState('RegressingHv');
  const [lang, setLang] = useState(CN);
  const onClickLangFuncs = [()=>{setLang(CN)}, ()=>{setLang(EN)}];
  const appComponents = {"CalculatingPT": <CalculatingPT lang={lang}/>,
                         "RegressingHv": <RegressingHv lang={lang}/>}

  
  return (
    <div>
      <table width="1000px">
        <tr><GraphicPageTitle onClickLangFuncs={onClickLangFuncs} lang={lang} selectApp={[subApp, setSubApp]}/></tr>
        <br/>
        <tr>{appComponents[subApp]}        </tr>
        <br/>
        <tr><FootNote lang={lang}/></tr>
      </table>  

    </div>
  )
    
}