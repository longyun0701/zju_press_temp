//import React, { useRef, useEffect, useState} from 'react';

import React, { useRef, useEffect} from 'react';
import {substances, models} from './physical_models.js';

import * as d3 from 'd3';

const CN = 0;
//const EN = 1;

export function OutputGraph({data, lang}) {
    const chartRef = useRef(null);
    const width = 420, height = 320;

    const temp_cap_cn = '温度', temp_cap_en = 'Temperature';
    const temp_cap = (lang===CN) ? temp_cap_cn : temp_cap_en;

    const press_cap_cn = '压力', press_cap_en = 'Pressure';
    const press_cap = (lang===CN) ? press_cap_cn : press_cap_en;

    //const [axisScale, setAxisScale] = useState('linear');

    const  axisScale='linear';

    useEffect( ()=> {

        const margin = { top: 20, right: 30, bottom: 40, left: 40 };


        const svg = d3.select(chartRef.current);
        svg.selectAll('*').remove();
     

        const xScale = d3.scaleLinear()
                        .domain([0, 100])
                        .range([margin.left, width-margin.right]);
        
        
        let yScale = d3.scaleLinear()
                        .domain([0, 1])
                        .range([height-margin.bottom, margin.top]);
        
        if (axisScale === 'log') yScale = d3.scaleLog()
                                            .domain([1e-3, 10])
                                            .range([height-margin.bottom, margin.top]);

        if (data.length >0) {

            svg.selectAll('circle').data(data).join("circle")
                        .attr("cx", d => xScale(d[0]))
                        .attr("cy", d => yScale(d[1]))
                        .attr("r",  3)
                        .attr('fill', d=> (d[4]==='closed') ? d[3]:'white')
                        .attr('stroke', d=> (d[4]==='open') ? d[3]:'white')
                        .attr('stroke-width', '1px')
                        ;
        }

        const XaxisGenerator = d3.axisBottom(xScale);
        svg.append("g").call(XaxisGenerator).attr('transform', `translate(0,${height - margin.bottom})`);

        const XaxisGenerator2 = d3.axisTop(xScale);
        svg.append("g").call(XaxisGenerator2).attr('transform', `translate(0,${margin.top})`);

        const YaxisGenerator = d3.axisLeft(yScale);
        svg.append("g").call(YaxisGenerator).attr('transform', `translate(${margin.left},0)`);

        const YaxisGenerator2 = d3.axisRight(yScale);
        svg.append("g").call(YaxisGenerator2).attr('transform', `translate(${width - margin.right},0)`);

        svg.append("text")             
            .attr("transform", `translate(${width/2},${height-8})`)
            .style("text-anchor", "middle") // Centers the text above the axis
            .text(temp_cap+" (C)");

        svg.append("text")
            .attr("transform", `translate(${12},${height/2-8}), rotate(-90)`) // Rotates the text -90 degrees
            .style("text-anchor", "middle") // Ensures the text is centered after rotation
            .text(press_cap+" (atm)");

            /*
     
        svg.append('g')
          .attr('transform', `translate(0,${margin.top})`)
          .call(d3.axisLeft(y).ticks(null).tickSizeOuter(0));
          */

    }, [data,lang]);



    return (
        <div>
            <svg width={width+'px'} height={height+'px'} ref={chartRef} />
        </div>
    );
}


export function OutputTable({data, lang}){

    const columns_cn = ['','模型-物质',' 温度 (C)', '气压 (atm)'];
    const columns_en = ['', 'Model-Sub.', 'Temp. (C)', 'Press. (atm)'];
    const cols = (lang===CN)?columns_cn: columns_en;
    const result_cap_cn = '暂无计算结果', result_cap_en = 'No computation results yet';
    const result_cap = (lang===CN)?result_cap_cn: result_cap_en;

    return (
        <div>

        {(data.length===0)?
        <tr align='center'>
            {result_cap}
        </tr>
        :
        <div>

        <br/>

        <tr className="underscore-row" align="center">
            <td width="30px">{cols[0]}</td>
            <td width="150px">{cols[1]}</td>
            <td width="60px">{cols[2]}</td>
            <td width="60px">{cols[3]}</td>
        </tr>

        {data.map((d,i)=>{
            //const model = (lang===CN)?models[selectedModel].name_cn:models[selectedModel].name_en;
            //const substance = (lang===CN)?substances[selectedSubstance].name_cn:substances[selectedSubstance].name_en;
            //const model_sub = models[selectedModel].abbr + '-' + substances[selectedSubstance].abbr;
            const temp = d[0].toFixed(2);
            const press = d[1].toFixed(4);
            const model_sub = d[2];

            return (

                <tr className="underscore-row2">
                    <td className="tableData" padding='2px' align="right">{i+1}</td>
                    <td className="tableData" padding="2px" align="center">{model_sub}</td>
                    <td className="tableData" padding="2px" align="right">{temp}</td>
                    <td className="tableData" padding="2px" align="right">{press}</td>                
                </tr>
                
            );

        })}
        </div>
        }

        </div>
    )

}

export function convertDataToCSV(data, lang, fileType) {

    //const columns_cn = '模型-物质,温度 (C),气压 (atm)';
    const columns_en = 'Model,Substance,Temperature (C),Pressure (atm)';
    //const cols = (lang===CN)?columns_cn: columns_en;
    const cols = columns_en;

    switch (fileType){
        case 'csvfile':
            const csvRows = [cols,
            ...data.map(d=>{
              const temp = d[0].toFixed(2);
              const press = d[1].toFixed(4);
              const model_sub = d[2].split('-');

              return (
                  models[model_sub[0]].name_en+',' + substances[model_sub[1]].name_en +','+temp+','+press
              );
              })
          ];
          return csvRows.join('\n'); 
        case 'txtdata':
            const txtRows = data.map(d=>{
                    const temp = d[0].toFixed(2);
                    const press = d[1].toFixed(4);
                    return (temp+','+press);
                  })
            return txtRows.join('\n'); 
        default:
            console.log('Wrong downloading file type')
    }

  }

export function downloadCSV(data, lang, filename = 'TPData.csv', fileType) {
    const csvData = convertDataToCSV(data, lang, fileType);
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    // Create an anchor element and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link); // Append link to the body
    link.click(); // Programmatically click the link to trigger the download
    
    document.body.removeChild(link); // Clean up and remove the link
    URL.revokeObjectURL(url); // Release the object URL
  }
  
export function DataDownload({data, prompt, fileType, lang}) {
    const handleDownload = () => {
      downloadCSV(data, lang, 'TPData.csv', fileType); // Call the download function with your data and a filename
    };
  
    return (
      <button onClick={handleDownload}>{prompt}</button>
    );
  }


export function OutputTableRegress({data, lang}){

    const columns_cn = ['','气压 (atm)','沸点 (C)', 'ln(P/P0)', '1/T'];
    const columns_en = ['', 'Press. (atm)', 'B.P. (C)', 'ln(P/P0)', '1/T'];
    const cols = (lang===CN)?columns_cn: columns_en;
    const result_cap_cn = '暂无输入数据', result_cap_en = 'No exp data points yet';
    const result_cap = (lang===CN)?result_cap_cn: result_cap_en;

    return (
        <div>

        {(data.length===0)?
        <tr align='center'>
            {result_cap}
        </tr>
        :
        <div>

        <br/>

        <tr className="underscore-row" align="center">
            <td width="30px">{cols[0]}</td>
            <td width="80px">{cols[1]}</td>
            <td width="80px">{cols[2]}</td>
            <td width="80px">{cols[3]}</td>
            <td width="80px">{cols[4]}</td>
        </tr>

        {data.map((d,i)=>{
            const temp = d[0].toFixed(2);
            const press = d[1].toFixed(4);
            const temp_1 = d[2].toFixed(6);
            const lnP = d[3].toFixed(4);

            return (

                <tr className="underscore-row2">
                    <td className="tableData" padding='2px' align="right">{i+1}</td>
                    <td className="tableData" padding="2px" align="right">{press}</td>
                    <td className="tableData" padding="2px" align="right">{temp}</td>
                    <td className="tableData" padding="2px" align="right">{lnP}</td>
                    <td className="tableData" padding="2px" align="right">{temp_1}</td>                
                </tr>
                
            );

        })}
        </div>
        }

        </div>
    )

}

export function OutputGraphRegress({data, reg_params, lang}) {
    const chartRef = useRef(null);
    const width = 420, height = 320;
    const {slope,intercept} = reg_params;
    //const H = -slope*8.314*0.001; // vaparation enthalpy in kJ
    //const T0 = slope/intercept-273.15; // Boiling point at 1 bar, in C

    const temp_cap = '1/T (T in K)';
    const press_cap = 'ln(P/P0) (P0 = 1 bar)'

    const xValues = data.map(d => d[2]);
    const yValues = data.map(d => d[3]);

    // Finding min and max for x and y
    const minX0 = Math.min(...xValues);
    const maxX0 = Math.max(...xValues);
    const minY0 = Math.min(...yValues);
    const maxY0 = Math.max(...yValues);
    const linePaddingX = (maxX0-minX0)*0.2;
    const minX = minX0-linePaddingX, maxX = maxX0+linePaddingX;

    useEffect( ()=> {

        const margin = { top: 20, right: 30, bottom: 40, left: 40 };


        const svg = d3.select(chartRef.current);
        svg.selectAll('*').remove();
     

        const xScale = d3.scaleLinear()
                        .domain([0.001, 0.005])
                        .range([margin.left, width-margin.right]);
        
        
        const yScale = d3.scaleLinear()
                        .domain([-5, 2])
                        .range([height-margin.bottom, margin.top]);
        

        if (data.length >0) {

            svg.selectAll('circle').data(data).join("circle")
                        .attr("cx", d => xScale(d[2]))
                        .attr("cy", d => yScale(d[3]))
                        .attr("r",  3)
                        .attr('fill', 'red')
                        ;

            
        }

        if (slope !==0 || intercept !==0) {
            const minYh = slope * minX + intercept;
            const maxYh = slope * maxX + intercept;
            svg.append('line').attr('x1',xScale(minX)).attr('y1',yScale(minYh))
                .attr('x2',xScale(maxX)).attr('y2',yScale(maxYh))
                .attr('stroke', 'blue') // Set the line color
                .attr('stroke-width', 2) // Set the line width
                .attr('fill', 'none'); // Ensure the line does not get filled
        }


        const XaxisGenerator = d3.axisBottom(xScale);
        svg.append("g").call(XaxisGenerator).attr('transform', `translate(0,${height - margin.bottom})`);

        const XaxisGenerator2 = d3.axisTop(xScale);
        svg.append("g").call(XaxisGenerator2).attr('transform', `translate(0,${margin.top})`);

        const YaxisGenerator = d3.axisLeft(yScale);
        svg.append("g").call(YaxisGenerator).attr('transform', `translate(${margin.left},0)`);

        const YaxisGenerator2 = d3.axisRight(yScale);
        svg.append("g").call(YaxisGenerator2).attr('transform', `translate(${width - margin.right},0)`);

        svg.append("text")             
            .attr("transform", `translate(${width/2},${height-8})`)
            .style("text-anchor", "middle") // Centers the text above the axis
            .text(temp_cap);

        svg.append("text")
            .attr("transform", `translate(${12},${height/2-8}), rotate(-90)`) // Rotates the text -90 degrees
            .style("text-anchor", "middle") // Ensures the text is centered after rotation
            .text(press_cap);


    }, [data,reg_params,lang]);

    const eq = 'Y = ' + slope.toFixed(2)+' X + ' + intercept.toFixed(2);


    return (
        <div>
            <svg width={width+'px'} height={height+'px'} ref={chartRef} />
            <br/> {(slope!==0)&&eq}

        </div>
    );
}

export const fileFormats = {
    'csvfile': {name_cn: 'CSV文件 (带表头)',
                name_en: 'CSV File (with heading)',
                abbr: 'csvfile',
               },

    'txtdata': {name_cn: '纯文本 (无表头, 只含温度压力数据)',
                name_en: 'Plain Text (No heading, PT data only)',
                abbr: 'txtdata',
               },
}