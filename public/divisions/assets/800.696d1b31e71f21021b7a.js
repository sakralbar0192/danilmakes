"use strict";(self.webpackChunkdivisions_demo=self.webpackChunkdivisions_demo||[]).push([[800],{6312(e,t,i){var s;i.d(t,{C:()=>o,b:()=>s}),function(e){e.divisionsLayer="divisionsLayer",e.divisionDetailsLayer="divisionDetailsLayer",e.poolDetailsLayer="poolDetailsLayer"}(s||(s={}));const o={GET_ALL_DIVISIONS:"/DivisionService.asmx/GetActiveDetails",CREATE_DIVISION:"/DivisionService.asmx/AddDivision",DELETE_DIVISION:"/DivisionService.asmx/DeleteDivision",UPDATE_DIVISION:"/DivisionService.asmx/UpdateDivision",GET_DIVISION_DETAILS:"/DivisionService.asmx/GetDetailsById",GET_DIVISIONS_NAMES_LIST:"/DivisionService.asmx/GetActiveShort",GET_DIVISION_POOLS:"/ResourcePoolService.asmx/GetActiveShort"}},9248(e,t,i){i.d(t,{O:()=>s});const s={GET_POSSIBLE_MANAGERS:"/DivisionService.asmx/SelectedManagersList",SET_DIVISION_MANAGERS:"/DivisionService.asmx/SetManagers",GET_NOT_ASSIGNED_USER_BY_BRANCH_AND_DIVISION:"/DivisionService.asmx/GetNotAssignedUsersByBranchAndDivision",GET_NOT_ASSIGNED_USER_BY_POOL_AND_DIVISION:"/ResourcePoolService.asmx/GetNotAssignedUsersByPoolAndDivision",ASSIGN_USERS_INTO_DIVISIONS:"/DivisionService.asmx/AddUsersDivisionHistoryEntries",ASSIGN_USERS_INTO_POOL:"/ResourcePoolService.asmx/AddUsersPoolHistoryEntries"}},5456(e,t,i){i.d(t,{ks:()=>s,l8:()=>V});var s,o=i(3757),n=i(7843);!function(e){e.assignIntoDivision="into divisions",e.assignIntoPool="into pool"}(s||(s={}));var a=i(6161);const r=a.AH`.popup{width:min(890px,100%);height:570px;max-width:100%;max-height:min(80vh,100dvh - 32px)}.userTable{flex:1;overflow:auto}.userTable p{text-align:center}.userTable assign-users-popup-table{min-height:100%}.filters{display:flex;align-items:center;justify-content:space-between;padding:20px 10px 10px;margin:0 0 10px;border-bottom:1px solid gray}.filters .fieldset{padding:0;margin:0 20px 0 0}.filters label{flex-grow:1;width:auto;max-width:70px}@media(max-width:768px){.popup{width:100%;height:auto;min-height:50vh;max-height:min(92vh,100dvh)}.filters{flex-direction:column;align-items:stretch;gap:10px;padding:12px 8px 10px}.filters .fieldset{flex-direction:column;align-items:stretch;width:100%;margin:0}.filters label{max-width:none;margin:0 0 4px}.filters iceberg-select{width:100%}.filters iceberg-button{align-self:stretch}.userTable{min-height:200px;min-width:0;max-width:100%}}@media(max-width:480px){.filters{padding:10px 4px 8px}.userTable{min-height:160px}}`;var d=i(2745),l=i(581),c=i(8006),h=i(640);const p=a.AH`.dateHeaderCell{display:flex;align-items:center;width:265px}.dateHeaderCell label{width:60px;margin:0 10px 0 0}iceberg-date-input{display:block;width:170px}th:nth-child(2){width:270px}.dateField{display:flex;justify-content:flex-end;padding:0 30px 0 0}@media(max-width:768px){.dateHeaderCell{flex-direction:column;align-items:flex-start;width:auto;gap:4px}.dateHeaderCell label{width:auto;margin:0}iceberg-date-input{width:100%;max-width:160px}th:nth-child(2){width:auto;min-width:120px}.dateField{justify-content:flex-start;padding:0}}`,u=a.AH`.container{position:relative;display:flex;max-width:196px}iceberg-date-input{width:170px;margin:0 10px 0 0;z-index:2}iceberg-calendar{width:100%}button{padding:0;margin:0;background-color:rgba(0,0,0,0);border:0;cursor:pointer;z-index:2}button svg{fill:#0054a5}button:hover svg{fill:#f48120}.dropdown{box-sizing:border-box;position:absolute;top:calc(100% + 10px);left:0;display:none;width:100%;z-index:2}.overlay{display:none;position:fixed;inset:0;width:100vw;height:100vh;z-index:1}.dropdownShow .dropdown,.dropdownShow .overlay{display:flex}`;var b,g=i(3720);!function(e){e.month="month",e.year="year",e.decade="decade"}(b||(b={}));const v=a.AH`.calendar{display:flex;flex-direction:column;align-items:stretch;background:#fff;padding:5px;color:#333;border:1px solid #666}.calendar button{padding:0;margin:0;border:0;background-color:rgba(0,0,0,0);cursor:pointer}.calendar header{justify-content:space-between}.calendar footer{justify-content:center}.calendar main{display:flex;flex-direction:column;align-items:center;margin:10px 0}.calendar footer,.calendar header{display:flex;align-items:center;height:20px}.calendar footer button:hover,.calendar header button:hover{color:#0054a5}.calendar .current{border:1px solid #0054a5;background-color:#edf9ff;color:#0054a5}.calendar .navButton{position:relative;width:16px;height:16px}.calendar .navButton::after{content:"";position:absolute;inset:0;margin:auto;width:0;height:0;transition:.5s all ease;border:5px solid transparent;pointer-events:none}.calendar .navButton.next::after{border-left:7px solid #999}.calendar .navButton.prev::after{border-right:7px solid #999}.calendar .navButton:hover.next::after{border-left:7px solid #0054a5}.calendar .navButton:hover.prev::after{border-right:7px solid #0054a5}.calendar .calendarRow{display:flex;align-items:center;justify-content:center}.calendar .calendarRow button:hover{background-color:#edf9ff;border:1px solid #0054a5;color:#0054a5}.calendar .calendarRow button.notCurrentMonthDay{color:#999}.calendar .calendarRow.week button,.calendar .calendarRow.week span{width:20px;height:20px;text-align:center}.calendar .calendarRow.month button{width:40px;height:40px}.calendar .calendarRow.year button{width:40px;height:40px}`;var m=i(7787);function y(e){return 0===e.getDay()?6:e.getDay()-1}var f=function(e,t,i,s){var o,n=arguments.length,a=n<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,s);else for(var r=e.length-1;r>=0;r--)(o=e[r])&&(a=(n<3?o(a):n>3?o(t,i,a):o(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};class I extends a.WF{constructor(){super(...arguments),this.currentLayer=b.month,this.choosenDate=new Date,this.currentDate=new Date,this.today=new Date,this.MONTH_STEP=1,this.YEAR_STEP=1,this.DECADE_STEP=9,this.YEARS_AMPLITUDE_ON_DECADE_LAYER=4,this.WEEK_DAYS=["Mo","Tu","We","Th","Fr","Sa","Su"],this.DATE_CHOOSE_EVENT_NAME="chooseDate"}render(){return a.qy`
            <div class='calendar'>
                ${this.headerTemplate()}
                <main>
                    ${(0,m.S)(this.currentLayer,[[b.month,()=>this.monthTemplate()],[b.year,()=>this.yearTemplate()],[b.decade,()=>this.decadeTemplate()]],()=>a.qy`<h1>Error</h1>`)}
                </main>
                ${this.footerTemplate()}
            </div>
        `}headerTemplate(){return a.qy`
            <header>
                <button 
                    class='navButton prev'
                    type='button'
                    @click=${this.prevButtonClickHandler}
                ></button>
                <button
                    @click=${this.changeLayer}
                >
                    ${(0,m.S)(this.currentLayer,[[b.month,()=>this.monthYearDateTemplate(this.currentDate)],[b.year,()=>this.yearDateTemplate(this.currentDate)],[b.decade,()=>this.decadeDateTemplate(this.currentDate)]],()=>a.qy`<h1>Error</h1>`)}
                </button>
                <button 
                    class='navButton next'
                    type='button'
                    @click=${this.nextButtonClickHandler}
                ></button>
            </header>
        `}monthTemplate(){return a.qy`
            ${this.weekDaysTemplate()}
            ${this.monthDaysTemplate()}
        `}weekDaysTemplate(){return a.qy`
            <div class='calendarRow week'>
                ${this.WEEK_DAYS.map(e=>a.qy`<span>${e}</span>`)}
            </div>
        `}monthDaysTemplate(){const e=function(e){let t=!0,i=!0;const s=Array(6),o=[],n=e.getMonth(),a=e.getFullYear(),r=new Date(a,n),d=r.getMonth(),l=r.getDate(),c=y(r),h=new Date(a,n,l-c),p=new Date(h);do{const e=y(p),a=p.getDate(),r=p.getMonth(),l={day:a,date:new Date(p),isDayInCurrentMonth:r===n};s[e]=l,6===e&&o.push([...s]),p.setDate(a+1);const c=y(p),h=p.getMonth();t=e<c,i=h===d||h===n}while(t||i);return o}(this.currentDate);return a.qy`
            ${e.map(e=>a.qy`
                <div class='calendarRow week'>
                    ${this.weekTemplate(e)}
                </div>
            `)}
        `}weekTemplate(e){return a.qy`
            ${e.map(e=>{const t={notCurrentMonthDay:!e.isDayInCurrentMonth,current:(i=e.date,s=this.choosenDate,Boolean(i.getFullYear()===s.getFullYear()&&i.getMonth()===s.getMonth()&&i.getDate()===s.getDate()))};var i,s;return a.qy`
                        <button
                            class=${(0,g.H)(t)}
                            @click=${()=>this.dayClickHandler(e.date)}
                        >
                            ${e.day}
                        </button>
                    `})}
        `}yearTemplate(){const e=function(e){const t=Array(4),i=[];let s=0;const o=e.getFullYear();for(let e=0;e<3;e++)for(let n=0;n<4;n++){const a=new Date(o,s);t[n]={month:a.toLocaleDateString("en",{month:"short"}),date:a},s+=1,3===n&&(i[e]=[...t])}return i}(this.currentDate);return a.qy`
            ${e.map(e=>this.monthsGroupTemplate(e))}
        `}monthsGroupTemplate(e){return a.qy`
            <div class='calendarRow month'>
                ${e.map(e=>this.monthButtonTemplate(e))}
            </div>
        `}monthButtonTemplate(e){const t={current:(i=e.date,s=this.choosenDate,Boolean(i.getFullYear()===s.getFullYear()&&i.getMonth()===s.getMonth()))};var i,s;return a.qy`
            <button
                class=${(0,g.H)(t)}
                @click=${()=>this.monthButtonClickHandler(e.date)}
            >
                ${e.month}
            </button>
        `}decadeTemplate(){const e=function(e){const t=Array(3),i=[],s=e.getFullYear(),o=e.getMonth();let n=s-4;for(let e=0;e<3;e++)for(let s=0;s<3;s++)t[s]={year:n,date:new Date(n,o)},n+=1,2===s&&(i[e]=[...t]);return i}(this.currentDate);return a.qy`
            ${e.map(e=>a.qy`
                <div class='calendarRow year'>
                    ${this.yearsGroupTemplate(e)}
                </div>
            `)}
        `}yearsGroupTemplate(e){return a.qy`
            ${e.map(e=>a.qy`
                <div class='calendarRow year'>
                    ${this.yearButtonTemplate(e)}
                </div>
            `)}
        `}yearButtonTemplate(e){const t={current:(i=e.date,s=this.choosenDate,Boolean(i.getFullYear()===s.getFullYear()))};var i,s;return a.qy`
            <button
                class=${(0,g.H)(t)}
                @click=${()=>this.yearButtonClickHandler(e.date)}
            >
                ${e.year}
            </button>
        `}footerTemplate(){return a.qy`
            <footer>
                <button
                    @click=${()=>{this.dayClickHandler(this.today)}}
                >
                    Today: ${this.monthDayDateTemplate(this.today)}, ${this.today.getFullYear()}
                </button>
            </footer>
        `}monthDayDateTemplate(e){return e.toLocaleString("en",{month:"long",day:"2-digit"})}monthYearDateTemplate(e){return a.qy`${e.toLocaleString("en",{month:"long",year:"numeric"})}`}yearDateTemplate(e){return a.qy`${e.toLocaleString("en",{year:"numeric"})}`}decadeDateTemplate(e){return a.qy`${e.getFullYear()-this.YEARS_AMPLITUDE_ON_DECADE_LAYER} - ${e.getFullYear()+this.YEARS_AMPLITUDE_ON_DECADE_LAYER}`}prevButtonClickHandler(){switch(this.currentLayer){case b.month:this.currentDate=new Date(this.currentDate.getFullYear(),this.currentDate.getMonth()-this.MONTH_STEP);break;case b.year:this.currentDate=new Date(this.currentDate.getFullYear()-this.YEAR_STEP,this.currentDate.getMonth());break;case b.decade:this.currentDate=new Date(this.currentDate.getFullYear()-this.DECADE_STEP,this.currentDate.getMonth())}}nextButtonClickHandler(){switch(this.currentLayer){case b.month:this.currentDate=new Date(this.currentDate.getFullYear(),this.currentDate.getMonth()+this.MONTH_STEP);break;case b.year:this.currentDate=new Date(this.currentDate.getFullYear()+this.YEAR_STEP,this.currentDate.getMonth());break;case b.decade:this.currentDate=new Date(this.currentDate.getFullYear()+this.DECADE_STEP,this.currentDate.getMonth())}}dayClickHandler(e){this.choosenDate=e,this.dispatchDateChooseEvent(e)}monthButtonClickHandler(e){this.currentDate=new Date(this.currentDate.getFullYear(),e.getMonth()),this.currentLayer=b.month}yearButtonClickHandler(e){this.currentDate=new Date(e.getFullYear(),this.currentDate.getMonth()),this.currentLayer=b.year}dispatchDateChooseEvent(e){const t={date:e},i=new CustomEvent(this.DATE_CHOOSE_EVENT_NAME,{detail:t,bubbles:!0,composed:!0});this.dispatchEvent(i)}changeLayer(){switch(this.currentLayer){case b.month:this.currentLayer=b.year;break;case b.year:this.currentLayer=b.decade;break;case b.decade:this.currentLayer=b.month}}}I.styles=a.AH`
        ${v}
    `,f([(0,d.wk)()],I.prototype,"currentLayer",void 0),f([(0,d.wk)()],I.prototype,"currentHeader",void 0),f([(0,d.wk)()],I.prototype,"choosenDate",void 0),f([(0,d.MZ)()],I.prototype,"currentDate",void 0);var E=i(7610);function T(e){return e.toLocaleString("ru",{month:"2-digit",year:"numeric",day:"2-digit"})}var x=i(9875);class D extends x.Qe{onInputHandler(e){const t=e.target,i=t.value.trim().replace(/[^0-9.]?/g,"");this.value=i,t.value=i,super.onInputHandler(e)}}const S=/^([1-9]|0[1-9]|[12][0-9]|3[01])\.([1-9]|0[1-9]|1[012])\.(19[6789][0-9]|20[0-9][0-9])$/;var w=i(3386),_=function(e,t,i,s){var o,n=arguments.length,a=n<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,s);else for(var r=e.length-1;r>=0;r--)(o=e[r])&&(a=(n<3?o(a):n>3?o(t,i,a):o(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};(0,o.X)(n.I.icebergDateInput,D),(0,o.X)(n.I.icebergCalendar,I);class P extends a.WF{constructor(){super(...arguments),this.dropdownShow=!1,this.currentDate=new Date,this.calendarIconSizes={width:16,height:16},this.INPUT_MAX_LENGHT=10,this.CHANGE_CURRENT_DATE_EVENT_NAME="changeDate",this.icebergCalendarRef=(0,E._)()}render(){const e={container:!0,dropdownShow:this.dropdownShow};return a.qy`
            <div class=${(0,g.H)(e)}>
                <iceberg-date-input
                    @focus=${this.showCalendar}
                    .value=${T(this.currentDate)}
                    @valueChange=${this.valueChangeHandler}
                    maxlength=${this.INPUT_MAX_LENGHT}
                ></iceberg-date-input>
                <button
                    type='button'
                    @click=${this.showCalendar}
                >
                    ${function({width:e,height:t}){return a.qy`
        <svg xmlns:xlink="http://www.w3.org/1999/xlink" height=${t} width=${e} viewBox="0 0 652.801 652.801">
            <path d="M142.8,408h40.8c22.542,0,40.8-18.279,40.8-40.801V326.4c0-22.542-18.258-40.8-40.8-40.8h-40.8
            c-22.542,0-40.8,18.258-40.8,40.8v40.799C102,389.721,120.258,408,142.8,408z M142.8,326.4h40.8v40.799h-40.8V326.4z
                M469.2,571.199H510c22.542,0,40.801-18.258,40.801-40.799V489.6c0-22.541-18.259-40.799-40.801-40.799h-40.8
            c-22.521,0-40.8,18.258-40.8,40.799V530.4C428.4,552.941,446.658,571.199,469.2,571.199z M469.2,489.6H510V530.4h-40.8V489.6z
                M469.2,408H510c22.542,0,40.801-18.279,40.801-40.801V326.4c0-22.542-18.259-40.8-40.801-40.8h-40.8
            c-22.521,0-40.8,18.258-40.8,40.8v40.799C428.4,389.721,446.658,408,469.2,408z M469.2,326.4H510v40.799h-40.8V326.4z
                M550.801,40.8H469.2V20.4c0-11.261-9.139-20.4-20.399-20.4s-20.4,9.139-20.4,20.4v20.4h-204V20.4C224.4,9.139,215.261,0,204,0
            s-20.4,9.139-20.4,20.4v20.4H102c-45.063,0-81.6,36.537-81.6,81.6v448.799c0,45.064,36.537,81.602,81.6,81.602h448.8
            c45.063,0,81.6-36.537,81.6-81.602V122.4C632.4,77.336,595.864,40.8,550.801,40.8z M591.601,571.199
            c0,22.543-18.258,40.801-40.8,40.801H102c-22.542,0-40.8-18.279-40.8-40.801V204h530.4V571.199z M591.601,163.2H61.2v-40.8
            c0-22.542,18.258-40.8,40.8-40.8h81.6V102c0,11.261,9.139,20.4,20.4,20.4s20.4-9.139,20.4-20.4V81.6h204V102
            c0,11.261,9.14,20.4,20.4,20.4S469.2,113.261,469.2,102V81.6h81.601c22.542,0,40.8,18.258,40.8,40.8V163.2z M306,571.199h40.8
            c22.542,0,40.8-18.258,40.8-40.799V489.6c0-22.541-18.258-40.799-40.8-40.799H306c-22.521,0-40.8,18.258-40.8,40.799V530.4
            C265.2,552.941,283.458,571.199,306,571.199z M306,489.6h40.8V530.4H306V489.6z M306,408h40.8c22.542,0,40.8-18.279,40.8-40.801
            V326.4c0-22.542-18.258-40.8-40.8-40.8H306c-22.521,0-40.8,18.258-40.8,40.8v40.799C265.2,389.721,283.458,408,306,408z
                M306,326.4h40.8v40.799H306V326.4z M142.8,571.199h40.8c22.542,0,40.8-18.258,40.8-40.799V489.6
            c0-22.541-18.258-40.799-40.8-40.799h-40.8c-22.542,0-40.8,18.258-40.8,40.799V530.4C102,552.941,120.258,571.199,142.8,571.199z
                M142.8,489.6h40.8V530.4h-40.8V489.6z"/>
        </svg>
    `}(this.calendarIconSizes)}
                </button>
                <div class='dropdown'>
                    <iceberg-calendar
                        ${(0,E.K)(this.icebergCalendarRef)}
                        .choosenDate=${this.currentDate}
                        .currentDate=${this.currentDate}
                        @chooseDate=${this.chooseDateHandler}
                    ></iceberg-calendar>
                </div>
                <div class='overlay' @click=${this.hideCalendar}></div>
            </div>
        `}showCalendar(){this.dropdownShow=!0}hideCalendar(){this.dropdownShow=!1}chooseDateHandler(e){this.currentDate=e.detail.date,this.dispatchChangeCurrentDateEvent(),this.hideCalendar()}valueChangeHandler(e){const t=e.target.value;if(S.test(t)){const s=(0,w.U)(t);null===s?((i=e.detail.input).setCustomValidity("Invalid date"),i.reportValidity(),setTimeout(()=>{i.setCustomValidity("")},1500)):this.setDates(s)}else e.target.value=T(this.currentDate),this.setDates(new Date);var i}setDates(e){this.currentDate=new Date(e),this.icebergCalendarRef.value&&(this.icebergCalendarRef.value.choosenDate=new Date(e)),this.dispatchChangeCurrentDateEvent()}dispatchChangeCurrentDateEvent(){const e={date:new Date(this.currentDate),dateString:T(this.currentDate)},t=new CustomEvent(this.CHANGE_CURRENT_DATE_EVENT_NAME,{detail:e,bubbles:!0,composed:!0});this.dispatchEvent(t)}}P.styles=a.AH`
        ${u}
    `,_([(0,d.wk)()],P.prototype,"dropdownShow",void 0),_([(0,d.MZ)()],P.prototype,"currentDate",void 0);var k=i(7771),A=i(6752);function C(e){const t=[],i={content:e.Name},s=document.createElement("iceberg-date-input");s.addEventListener(s.VALUE_CHANGE_EVENT,t=>{S.test(t.detail.value)?e.AssignedStartDate=t.detail.value:t.detail.input.value=e.AssignedStartDate??""}),s.value=e.AssignedStartDate??"";const o={content:A.qy`
            <div class='dateField'>
                ${s}
            </div>
        `,classes:[k.Az.TEXT_CENTERED]},n={content:e.BranchName},a={userItem:e,dateField:s},r={content:A.qy`
            <iceberg-checkbox
                ?checked=${e.Checked}
                .key=${a}
            ></iceberg-checkbox>
        `,classes:[k.Az.SM]};return t.push(i,o,n,r),{id:e.Id,row:t}}var O=function(e,t,i,s){var o,n=arguments.length,a=n<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,s);else for(var r=e.length-1;r>=0;r--)(o=e[r])&&(a=(n<3?o(a):n>3?o(t,i,a):o(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};(0,o.X)(n.I.icebergDateField,P);class N extends k.MY{constructor(){super(...arguments),this.NOT_DEFINED_TABLE_MESSAGE="Not assigned user list is empty.",this.convertEntityFunction=C,this.headerCells=[]}headerTemplate(){const e=[{content:"User"},{content:this.selectedDate?a.qy`
                        <div class='dateHeaderCell'> 
                            <label>
                                Start date: 
                            </label>
                            <iceberg-date-field
                                .currentDate=${this.selectedDate}
                            ></iceberg-date-field>
                        </div>
                    `:a.qy`<iceberg-loader></iceberg-loader>`},{content:"Branch"},{content:"",classes:[k.Az.SM]}];return a.qy`
            <thead>
                <tr>
                    ${e.map((e,t)=>this.headerCellTemplate(e,t))}
                </tr>
            </thead>
        `}}N.styles=[k.MY.styles,a.AH`
          ${p}  
        `],O([(0,d.MZ)({type:Object,reflect:!1,attribute:!1})],N.prototype,"displayedEntities",void 0),O([(0,d.MZ)({type:Date,reflect:!1,attribute:!1})],N.prototype,"selectedDate",void 0);var L=i(8192),M=i(6388),R=i(3978),$=i(8029),H=i(9248),B=function(e,t,i,s){var o,n=arguments.length,a=n<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,s);else for(var r=e.length-1;r>=0;r--)(o=e[r])&&(a=(n<3?o(a):n>3?o(t,i,a):o(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};(0,h.JB)(),(0,l.Rx)(),async function(){(0,o.X)(n.I.assignUsersPopupTable,N)}();class U extends c.S{constructor(){super(...arguments),this.selectedDate=new Date,this.ALL_OPTION_ID=0,this.USERS_WITHOUT_OPTION_ID=-1,this.FILTER_BUTTON_CLICK_EVENT_NAME="filterButtonClickEvent",this.EMPTY_CHOSEN_USER_LIST_MESSAGE="No user has been selected",this.ERROR_WHILE_CREATE_FILTERS="Sorry, the filtering is broken",this.ERROR_WHILE_CREATE_USER_TABLE="Sorry, failed to show users",this.selectedPoolOption=this.ALL_OPTION_ID,this.selectedDivisionOption=this.ALL_OPTION_ID,this.selectedBranchOption=this.ALL_OPTION_ID,this.assignUsersTableRef=(0,E._)()}headerTemplate(){return a.qy`
            <header>
                Assign users ${this.mode}
            </header>
        `}mainTemplate(){return this.mode?a.qy`
                ${(0,m.S)(this.mode,[[s.assignIntoDivision,()=>(0,L.T)(this.divisionFiltersTemplate(),this.loaderTemplate())],[s.assignIntoPool,()=>(0,L.T)(this.poolFiltersTemplate(),this.loaderTemplate())]],()=>this.filtersErrorTemplate())}

                <div class ='userTable'>
                    ${(0,L.T)(this.userTableTemplate(),this.loaderTemplate())}
                </div>
            `:this.loaderTemplate()}divisionFiltersTemplate(){return this.selectableBranches&&this.selectableDivisions?Promise.all([this.selectableBranches,this.selectableDivisions]).then(([e,t])=>{if(t&&e){const i=this.createDivisionOptions(t),s=this.createBranchesOptions(e);return a.qy`
                            <div class="filters">
                                <div class='fieldset'>
                                    <label>
                                        Branch:
                                    </label>
                                    <iceberg-select
                                        .options=${s}
                                        .selectedOptionId=${this.selectedBranchOption}
                                        @changeSelectedValue=${this.changeSelectedBranchOptionHandler}
                                    ></iceberg-select>
                                </div>

                                <div class='fieldset'>
                                    <label>
                                        Division:
                                    </label>
                                    <iceberg-select
                                        .options=${i}
                                        .selectedOptionId=${this.selectedDivisionOption}
                                        @changeSelectedValue=${this.changeSelectedDivisionOptionHandler}
                                    ></iceberg-select>
                                </div>
                            
                                <iceberg-button
                                    .size=${l.bf.XS}
                                    @click=${this.filterButtonClickHandler}
                                >
                                    Filter
                                </iceberg-button>
                            </div>
                        `}return this.filtersErrorTemplate()}):this.filtersErrorTemplate()}async poolFiltersTemplate(){return this.selectablePools?Promise.resolve(this.selectablePools).then(e=>{if(e){const t=this.createPoolsOptions(e);return a.qy`
                            <div class="filters">
                                <div class='fieldset'>
                                    <label>
                                        Pool:
                                    </label>
                                    <iceberg-select
                                        .options=${t}
                                        .selectedOptionId=${this.selectedPoolOption}
                                        @changeSelectedValue=${this.changeSelectedPoolOptionHandler}
                                    ></iceberg-select>
                                </div>
                            
                                <iceberg-button
                                    .size=${l.bf.XS}
                                    @click=${this.filterButtonClickHandler}
                                >
                                    Filter
                                </iceberg-button>
                            </div>
                        `}return this.filtersErrorTemplate()}):this.filtersErrorTemplate()}filtersErrorTemplate(){return a.qy`<span class='error'>${this.ERROR_WHILE_CREATE_FILTERS}</span>`}async userTableTemplate(){return this.filteredUsers?await Promise.resolve(this.filteredUsers).then(e=>a.qy`
                        <assign-users-popup-table
                            ${(0,E.K)(this.assignUsersTableRef)} 
                            .displayedEntities=${e}
                            .selectedDate=${this.selectedDate}
                            @changeDate=${this.changeDateHandler}
                            @change=${this.checkedChangeHandler}
                        ></assign-users-popup-table>
                    `):this.userTableErrorTemplate()}userTableErrorTemplate(){return a.qy`<span class='error'>${this.ERROR_WHILE_CREATE_USER_TABLE}</span>`}createDivisionOptions(e){const t=e.map(e=>({id:e.Id,value:e.Name})),i={id:this.USERS_WITHOUT_OPTION_ID,value:"Users without division"},s={id:this.ALL_OPTION_ID,value:"All"};return t.unshift(s,i),t}createBranchesOptions(e){const t=e.map(e=>{const t=e.Branches.map(e=>({id:e.Id,value:e.Name}));return{value:e.Name,id:e.Id,options:t}}),i={id:this.ALL_OPTION_ID,value:"All"};return t.unshift(i),t}createPoolsOptions(e){const t=e.map(e=>({id:e.Id,value:e.Name})),i={id:this.USERS_WITHOUT_OPTION_ID,value:"Users without pool"},s={id:this.ALL_OPTION_ID,value:"All"};return t.unshift(s,i),t}filterButtonClickHandler(){this.needToAskBeforeClosing=!0;const e={mode:this.mode},t=new CustomEvent(this.FILTER_BUTTON_CLICK_EVENT_NAME,{detail:e,bubbles:!0,composed:!0});this.dispatchEvent(t)}changeSelectedPoolOptionHandler(e){this.needToAskBeforeClosing=!0,this.selectedPoolOption=Number(e.detail.selectedOption.id)}changeSelectedDivisionOptionHandler(e){this.needToAskBeforeClosing=!0,this.selectedDivisionOption=Number(e.detail.selectedOption.id)}changeSelectedBranchOptionHandler(e){this.needToAskBeforeClosing=!0,this.selectedBranchOption=Number(e.detail.selectedOption.id)}async checkedChangeHandler(e){this.needToAskBeforeClosing=!0;const{checked:t,key:i}=e.detail,s=t?T(this.selectedDate):"";Promise.resolve(this.filteredUsers).then(e=>{if(e){const o=e.find(e=>e.Id===i.userItem.Id);o&&(o.Checked=t,o.AssignedStartDate=s),this.filteredUsers=[...e]}}),i.dateField.value=s}changeDateHandler(e){this.needToAskBeforeClosing=!0,this.selectedDate=e.detail.date}async okClick(){this.isLoading=!0;const e=await Promise.resolve(this.filteredUsers).then(e=>e?e.filter(e=>e.Checked):[]);let t={IsSucceeded:!1};if(this.mode===s.assignIntoDivision){const i=e.map(e=>({UserId:e.Id,StartDate:e.AssignedStartDate??""}));i.length?t=await async function(e,t){const i=H.O.ASSIGN_USERS_INTO_DIVISIONS,s=$.WT.POST,o={users:t,divisionId:e};return(0,R.b)({url:i,method:s,data:o})}(this.currentId,i):(this.showMessage(this.EMPTY_CHOSEN_USER_LIST_MESSAGE,!1),this.isLoading=!1)}else if(this.mode===s.assignIntoPool){const i=e.map(e=>({UserId:e.Id,StartDate:e.AssignedStartDate??""}));i.length?t=await async function(e,t){const i=H.O.ASSIGN_USERS_INTO_POOL,s=$.WT.POST,o={poolId:e,users:t};return(0,R.b)({url:i,method:s,data:o})}(this.currentId,i):(this.showMessage(this.EMPTY_CHOSEN_USER_LIST_MESSAGE,!1),this.isLoading=!1)}if(t.IsSucceeded){const e={IsSucceeded:!0,Users:t.Value},i=new CustomEvent(this.RESULT_EVENT_NAME,{detail:e,bubbles:!0,composed:!0});this.dispatchEvent(i),this.visible=!1,this.isLoading=!1}else{const e=t.Message?t.Message:M.mk;this.showMessage(e,!1),this.isLoading=!1}}}async function V(){(0,o.X)(n.I.assignUsersPopup,U)}U.styles=[c.S.styles,a.AH`
          ${r}  
        `],B([(0,d.MZ)({type:Number,reflect:!1,attribute:!1})],U.prototype,"currentId",void 0),B([(0,d.MZ)({type:String,reflect:!1,attribute:!1})],U.prototype,"mode",void 0),B([(0,d.MZ)({type:Array,reflect:!1,attribute:!1})],U.prototype,"selectableBranches",void 0),B([(0,d.MZ)({type:Array,reflect:!1,attribute:!1})],U.prototype,"selectableDivisions",void 0),B([(0,d.MZ)({type:Array,reflect:!1,attribute:!1})],U.prototype,"selectablePools",void 0),B([(0,d.MZ)({type:Array,reflect:!1,attribute:!1})],U.prototype,"filteredUsers",void 0)},9800(e,t,i){var s=i(3757),o=i(7843),n=i(6161);const a=n.AH`:host{display:block;width:100%;max-width:100%;min-width:0;overflow-x:clip}.breadCrumbs a{cursor:pointer;color:#0054a5}.entityName{font-weight:700}@media(max-width:768px){.breadCrumbs{font-size:12px;line-height:1.5;margin:0 0 12px;word-break:break-word}}@media(max-width:480px){.breadCrumbs{font-size:11px}}`;var r,d=i(2745),l=i(7787),c=i(7610),h=i(581);!function(e){e.modifyDivision="modifyDivision",e.modifyPool="modifyPool",e.assignUsers="assignUsers,",e.editPoolUser="editPoolUser",e.updateManagers="updateManagers"}(r||(r={}));const p="division_id",u="pool_id";var b=i(8029),g=i(6388),v=i(6312),m=i(3978);const y=n.AH`:host{display:inline-flex}input{display:none}input+label{position:relative;display:inline-flex;align-items:center;width:100%;transition:.25s;cursor:pointer}input+label::before{content:"";width:13px;height:13px;margin:0 5px 0 0;background:rgba(0,0,0,0);border:2px solid #999}input+label::after{content:"";position:absolute;opacity:0}input+label.reverse{flex-direction:row-reverse;justify-content:space-between}input+label.reverse::before{margin:0}input+label.reverse span{margin:0 5px 0 0}input[type=checkbox]+label::before{border-radius:3px}input[type=checkbox]+label::after{inset:2px auto auto 6px;width:3px;height:9px;border-bottom:2px solid #fff;border-right:2px solid #fff;transform:rotateZ(42deg)}input[type=checkbox]+label.reverse::after{inset:2px 6px auto auto}input[type=checkbox]:checked+label::before{border-color:#0054a5;background:#0054a5}input[type=checkbox]:checked+label::after{opacity:1}input[type=checkbox]:disabled+label::before{background:#d3d3d3;border-color:#d3d3d3}input[type=radio]+label::before{border-radius:50%;border-color:#0054a5;border-width:3px}input[type=radio]+label::after{inset:auto auto auto 5px;width:9px;height:9px;border-radius:50%;background-color:#0054a5}input[type=radio]+label.reverse::after{inset:auto 5px auto auto}input[type=radio]:checked+label::after{opacity:1}input[type=radio]:disabled+label::before{border-color:#d3d3d3}input[type=radio]:disabled+label::after{background:#d3d3d3}input:disabled+label{cursor:default}input:disabled+label span{color:#d3d3d3}`;var f=i(31),I=i(302);const E=function*(e){for(yield e;;)yield++e}(Math.random());var T=function(e,t,i,s){var o,n=arguments.length,a=n<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,s);else for(var r=e.length-1;r>=0;r--)(o=e[r])&&(a=(n<3?o(a):n>3?o(t,i,a):o(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};class x extends n.WF{constructor(){super(...arguments),this.checked=!1,this.type="checkbox",this.CHECKED_CHANCHE_EVENT="change"}connectedCallback(){super.connectedCallback(),this.uniqId=String(E.next().value)}render(){return n.qy`
            <input
                id=${this.uniqId}
                type=${this.type}
                ?checked=${this.checked}
                ?disabled=${this.disabled}
                @change=${this.onChangeHandler}
            />
            <label
                for=${this.uniqId}
                class=${(0,f.J)(this.positioningType||void 0)}
            >
                <span>
                ${(0,I.z)(this.label,()=>n.qy`${this.label}`,()=>n.qy`<slot></slot>`)}
                </span>
            </label>
        `}onChangeHandler(e){const t=e.target;this.checked=!this.checked;const i={checkbox:t,checked:this.checked,key:this.key},s=new CustomEvent(this.CHECKED_CHANCHE_EVENT,{detail:i,bubbles:!0,composed:!0});this.dispatchEvent(s)}}function D(){(0,s.X)(o.I.icebergCheckbox,x)}x.styles=n.AH`
        ${y}
    `,T([(0,d.MZ)({type:Boolean})],x.prototype,"disabled",void 0),T([(0,d.MZ)({type:Boolean})],x.prototype,"checked",void 0),T([(0,d.MZ)({type:String})],x.prototype,"label",void 0),T([(0,d.MZ)({type:Object,attribute:!1})],x.prototype,"type",void 0),T([(0,d.MZ)({type:Object,attribute:!1})],x.prototype,"positioningType",void 0),T([(0,d.MZ)({type:Object,attribute:!1})],x.prototype,"key",void 0);var S=i(9875),w=i(8006),_=function(e,t,i,s){var o,n=arguments.length,a=n<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,s);else for(var r=e.length-1;r>=0;r--)(o=e[r])&&(a=(n<3?o(a):n>3?o(t,i,a):o(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};(0,S.nJ)(),D();class P extends w.S{constructor(){super(...arguments),this.nameFieldRef=(0,c._)()}headerTemplate(){return n.qy`
            <header>
                ${this.mode} division
            </header>
        `}mainTemplate(){const e=this.mode===b.yy.DELETE;return this.divisionItem?n.qy`
                <main>
                    <div class="form">
                        <div class="fieldset requiredFieldset">
                            <label>Division name</label>
                            <iceberg-input
                                ${(0,c.K)(this.nameFieldRef)}
                                ?disabled=${e}
                                .value=${this.divisionItem.Name}
                                @valueChange=${this.divisionsNameChangeHandler}
                            ></iceberg-input>                        
                        </div>
                        
                        <div class="fieldset checkboxFieldset">
                            <iceberg-checkbox
                                @change=${this.DDCheckboxChangeHandler}
                                ?disabled=${e}
                                ?checked=${this.divisionItem.IsProduction}
                            >
                                Delivery division
                            </iceberg-checkbox>
                        </div>
                        <div class="fieldset checkboxFieldset">
                            <iceberg-checkbox
                                @change=${this.STAChangeHandler}
                                ?disabled=${e}
                                ?checked=${this.divisionItem.SendTimeApprovalNotifications}
                            >
                                Send time approval notifications
                            </iceberg-checkbox>
                        </div>
                    </div>
                </main>
            `:this.loaderTemplate()}async okClick(){this.isLoading=!0;const e=this.nameFieldRef.value,t={...this.divisionItem};if(e&&t.Name!==e.value&&(t.Name=e.value),t.Name){const e=await async function(e,t){let i,s;const o=b.WT.POST;switch(e){case b.yy.CREATE:s={name:t.Name,sendTimeApprovalNotifications:t.SendTimeApprovalNotifications,isProduction:t.IsProduction},i=v.C.CREATE_DIVISION;break;case b.yy.DELETE:s={divisionId:t.Id},i=v.C.DELETE_DIVISION;break;case b.yy.UPDATE:s={id:t.Id,name:t.Name,sendTimeApprovalNotifications:t.SendTimeApprovalNotifications,isProduction:t.IsProduction},i=v.C.UPDATE_DIVISION;break;default:i=""}return i?(0,m.b)({url:i,method:o,data:s}):{IsSucceeded:!1,Message:g.mk}}(this.mode,t);if(e.IsSucceeded){const t={IsSucceeded:e.IsSucceeded,DivisionItem:e.Value},i=new CustomEvent(this.RESULT_EVENT_NAME,{detail:t,bubbles:!0,composed:!0});this.dispatchEvent(i),this.visible=!1,this.isLoading=!1}else{const t=e.Message?e.Message:g.mk;this.showMessage(t,!1),this.isLoading=!1}}else{const e="The division name cannot be empty";this.showMessage(e,!1),this.isLoading=!1}}STAChangeHandler(e){this.needToAskBeforeClosing=!0,this.divisionItem={...this.divisionItem,SendTimeApprovalNotifications:e.detail.checked}}DDCheckboxChangeHandler(e){this.needToAskBeforeClosing=!0,this.divisionItem={...this.divisionItem,IsProduction:e.detail.checked}}divisionsNameChangeHandler(e){this.needToAskBeforeClosing=!0,this.divisionItem={...this.divisionItem,Name:e.detail.value}}}_([(0,d.MZ)({type:String,reflect:!1,attribute:!1})],P.prototype,"mode",void 0),_([(0,d.MZ)({type:Object,reflect:!1,attribute:!1})],P.prototype,"divisionItem",void 0);var k=i(8192);var A=i(640),C=function(e,t,i,s){var o,n=arguments.length,a=n<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,s);else for(var r=e.length-1;r>=0;r--)(o=e[r])&&(a=(n<3?o(a):n>3?o(t,i,a):o(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};(0,S.nJ)(),(0,A.JB)();class O extends w.S{constructor(){super(...arguments),this.EMPTY_MANAGER_ID=0,this.INVALID_EMPTY_POOL_NAME_MESSAGE="The pool name cannot be empty",this.nameFieldRef=(0,c._)()}headerTemplate(){return n.qy`
            <header>
                ${this.mode} pool
            </header>
        `}mainTemplate(){if(this.mode&&this.poolItem&&(this.mode===b.yy.DELETE||this.possibleManagers)){const e=this.mode===b.yy.DELETE;return n.qy`
                <main>
                    <div class="form">
                        <div class="fieldset requiredFieldset">
                            <label>Pool name</label>
                            <iceberg-input
                                ${(0,c.K)(this.nameFieldRef)}
                                ?disabled=${e}
                                .value=${this.poolItem.Name}
                                @valueChange=${this.poolNameChangeHandler}
                            ></iceberg-input>                     
                        </div>
                        
                        <div class="fieldset">
                            <label>Manager name</label>
                            ${e?n.qy`
                                        <iceberg-input
                                            disabled
                                            value=${(0,f.J)(this.poolItem.ManagerName)}
                                        ></iceberg-input> 
                                    `:(0,k.T)(this.managersSelectTemplate(),this.loaderTemplate())}
                        </div>
                    </div>
                </main>
            `}return this.loaderTemplate()}async managersSelectTemplate(){return Promise.resolve(this.possibleManagers).then(e=>{if(e){const t=this.createSelectOptions(e);return n.qy`
                        <iceberg-select
                            .options=${t}
                            .selectedOptionId=${this.poolItem.ManagerId}
                            @changeSelectedValue=${this.changeManagerIdHandler}
                        ></iceberg-select>
                    `}return"error"})}async okClick(){this.isLoading=!0;const e=this.nameFieldRef.value,t={...this.poolItem};if(e&&t.Name!==e.value&&(t.Name=e.value),!t.Name){const e=this.INVALID_EMPTY_POOL_NAME_MESSAGE;return this.showMessage(e,!1),void(this.isLoading=!1)}this.currentManagerId||(this.currentManagerId=this.EMPTY_MANAGER_ID),t.ManagerId=this.currentManagerId??t.ManagerId??this.EMPTY_MANAGER_ID;const i=await async function(e,t){let i,s;const o=b.WT.POST;switch(e){case b.yy.CREATE:s={divisionId:t.DivisionId,name:t.Name,managerId:t.ManagerId||0},i="/ResourcePoolService.asmx/AddPool";break;case b.yy.DELETE:s={poolId:t.Id},i="/ResourcePoolService.asmx/DeletePool";break;case b.yy.UPDATE:s={id:t.Id,name:t.Name,managerId:t.ManagerId||0},i="/ResourcePoolService.asmx/UpdatePool";break;default:i=""}return i?(0,m.b)({url:i,method:o,data:s}):{IsSucceeded:!1,Message:g.mk}}(this.mode,t);if(i.IsSucceeded){const e={IsSucceeded:i.IsSucceeded,PoolItem:i.Value},t=new CustomEvent(this.RESULT_EVENT_NAME,{detail:e,bubbles:!0,composed:!0});this.dispatchEvent(t),this.visible=!1,this.isLoading=!1}else{const e=i.Message?i.Message:g.mk;this.showMessage(e,!1),this.isLoading=!1}}createSelectOptions(e){const t=e.map(e=>({id:e.Id,value:e.Name}));return t.unshift({id:this.EMPTY_MANAGER_ID,value:""}),t}poolNameChangeHandler(e){this.needToAskBeforeClosing=!0,this.poolItem={...this.poolItem,Name:e.detail.value}}changeManagerIdHandler(e){this.needToAskBeforeClosing=!0,this.poolItem={...this.poolItem,ManagerId:Number(e.detail.selectedOption.id)}}}C([(0,d.MZ)({type:Object,reflect:!1,attribute:!1})],O.prototype,"poolItem",void 0),C([(0,d.MZ)({type:String,reflect:!1,attribute:!1})],O.prototype,"mode",void 0),C([(0,d.MZ)({type:Array,reflect:!1,attribute:!1})],O.prototype,"possibleManagers",void 0);var N=i(5456),L=i(3386);class M extends w.S{headerTemplate(){return n.qy`
            <header>
                Edit user pool
            </header>
        `}mainTemplate(){if(this.userItem){const e=(0,L.U)(this.userItem.StartDate)??new Date;return n.qy`
                <main>
                    <div class="form">
                        <div class="fieldset requiredFieldset">
                            <label>User name:</label>
                            <iceberg-input
                                disabled
                                .value=${this.userItem.Name}
                            ></iceberg-input>                        
                        </div>
                        
                        <div class="fieldset requiredFieldset">
                            <label>Pool:</label>
                            <iceberg-input
                                disabled
                                value=${(0,f.J)(this.userItem.PoolName)}
                            ></iceberg-input>                        
                        </div>
                        <div class="fieldset requiredFieldset">
                            <label>Pool start date:</label>
                            <iceberg-date-field
                                .currentDate=${e}
                                @changeDate=${this.changeDateHandler}
                            ></iceberg-date-field>                        
                        </div>
                    </div>
                </main>
            `}return this.loaderTemplate()}changeDateHandler(e){this.needToAskBeforeClosing=!0,this.userItem={...this.userItem,StartDate:e.detail.dateString}}async okClick(){if(this.isLoading=!0,this.userItem.StartDate&&this.userItem.FrameId&&this.userItem.PoolId){const e=await async function(e,t,i,s){const o={userId:e,id:t,poolId:i,startDate:s},n=b.WT.POST;return(0,m.b)({url:"/ResourcePoolService.asmx/UpdateUserPoolHistoryDate",method:n,data:o})}(this.userItem.Id,this.userItem.FrameId,this.userItem.PoolId,this.userItem.StartDate);if(e.IsSucceeded){const t={IsSucceeded:e.IsSucceeded,UserItem:e.Value},i=new CustomEvent(this.RESULT_EVENT_NAME,{detail:t,bubbles:!0,composed:!0});this.dispatchEvent(i),this.visible=!1,this.isLoading=!1}else{const t=e.Message?e.Message:g.mk;this.showMessage(t,!1),this.isLoading=!1}}else{const e="Specify date";this.showMessage(e,!1),this.isLoading=!1}}}!function(e,t,i,s){var o,n=arguments.length,a=n<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,s);else for(var r=e.length-1;r>=0;r--)(o=e[r])&&(a=(n<3?o(a):n>3?o(t,i,a):o(t,i))||a);n>3&&a&&Object.defineProperty(t,i,a)}([(0,d.MZ)({type:Object,reflect:!1,attribute:!1})],M.prototype,"userItem",void 0);var R=i(9248);async function $(e){const t=v.C.GET_DIVISION_DETAILS,i={divisionId:e},s=b.WT.POST;return(0,m.b)({url:t,data:i,method:s})}async function H(e){const t={poolId:e},i=b.WT.POST;return(0,m.b)({url:"/ResourcePoolService.asmx/GetDetailsById",data:t,method:i})}const B=n.AH`main{overflow:hidden auto}main ul li{margin:0 0 5px;padding:3px}main ul li iceberg-checkbox{display:inline-block;width:100%}`;var U=i(3881),V=i(4279),q=function(e,t,i,s){var o,n=arguments.length,a=n<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,s);else for(var r=e.length-1;r>=0;r--)(o=e[r])&&(a=(n<3?o(a):n>3?o(t,i,a):o(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};D();class F extends w.S{constructor(){super(...arguments),this.headerTitle="Edit division manager list"}mainTemplate(){return n.qy`
            ${(0,V.T)(this.possibleDivisionManagersListTemplate(),this.loaderTemplate())}
        `}async possibleDivisionManagersListTemplate(){return Promise.resolve(this.possibleDivisionManagers).then(e=>e?n.qy`
                        <main>
                            <ul>
                                ${(0,U.u)(e,e=>e.Id,e=>this.possibleDivisionManagerItemTemplate(e))}
                            </ul>
                        </main>
                    `:g.Rb)}possibleDivisionManagerItemTemplate(e){return n.qy`
            <li>
                <iceberg-checkbox
                    .positioningType=${"reverse"}
                    ?checked=${e.IsManager}
                    .key=${e}
                    @change=${this.checkedChangeHandler}
                >
                    ${e.Name}
                </iceberg-checkbox>
            </li>
        `}checkedChangeHandler(e){this.needToAskBeforeClosing=!0;const{checked:t,key:i}=e.detail;i.IsManager=t}async okClick(){this.isLoading=!0;const e=await this.getdivisionManagerIds();if(this.divisionId){const t=await async function(e,t){const i={divisionId:t,userIds:e},s=R.O.SET_DIVISION_MANAGERS,o=b.WT.POST;return(0,m.b)({url:s,method:o,data:i})}(e,this.divisionId);if(t.IsSucceeded){const e={IsSucceeded:t.IsSucceeded,Managers:t.Value},i=new CustomEvent(this.RESULT_EVENT_NAME,{detail:e,bubbles:!0,composed:!0});this.dispatchEvent(i),this.visible=!1,this.isLoading=!1}else{const e=t.Message?t.Message:g.mk;this.showMessage(e,!1),this.isLoading=!1}}}async getdivisionManagerIds(){const e=[];return await Promise.resolve(this.possibleDivisionManagers).then(t=>{t&&t.forEach(t=>{t.IsManager&&e.push(t.Id)})}),e}}F.styles=[w.S.styles,n.AH`
          ${B}  
        `],q([(0,d.MZ)()],F.prototype,"divisionId",void 0),q([(0,d.MZ)()],F.prototype,"possibleDivisionManagers",void 0);var j=function(e,t,i,s){var o,n=arguments.length,a=n<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,s);else for(var r=e.length-1;r>=0;r--)(o=e[r])&&(a=(n<3?o(a):n>3?o(t,i,a):o(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};(0,h.Rx)();class G extends n.WF{constructor(){super(),this.isPopupVisible=!1,this.modifyDivisionPopup=(0,c._)(),this.modifyPoolPopup=(0,c._)(),this.assignUsersPopup=(0,c._)(),this.editPoolUserPopup=(0,c._)(),this.updateDivisionManagersPopup=(0,c._)(),this.popstateChangeHandler=e=>{if(!e.state?.layer)return this.showDivisionsLayer(),void(this.previousLayer=this.currentLayer);switch(this.currentLayer=e.state.layer,this.divisionId=e.state.divisionId,this.poolId=e.state.poolId,this.previousLayer=this.currentLayer,e.state.layer){case v.b.divisionsLayer:this.divisions=this.getDivisions();break;case v.b.divisionDetailsLayer:this.divisionId&&(this.divisionItem=$(this.divisionId).then(e=>e.IsSucceeded?e.Value:void 0));break;case v.b.poolDetailsLayer:this.poolId&&(this.poolItem=H(this.poolId).then(e=>e.IsSucceeded?e.Value:void 0))}},this.goToDivisionsLayer=e=>{e.preventDefault(),this.showDivisionsLayer()},this.goToDivisionDetailsLayer=e=>{this.divisionId&&(e.preventDefault(),this.currentLayer=v.b.divisionDetailsLayer,this.divisionItem=$(this.divisionId).then(e=>e.IsSucceeded?e.Value:void 0))};const e=Object.fromEntries(new URLSearchParams(window.location.search).entries());if(e[b.iX]){const t=e[b.iX];switch(t){case v.b.divisionsLayer:this.showDivisionsLayer();break;case v.b.divisionDetailsLayer:e[p]?(this.currentLayer=t,this.divisionId=Number(e[p]),this.divisionItem=$(this.divisionId).then(e=>e.IsSucceeded?e.Value:void 0)):this.showDivisionsLayer();break;case v.b.poolDetailsLayer:Boolean(e[p])&&Boolean(e[u])?(this.currentLayer=t,this.divisionId=Number(e[p]),this.poolId=Number(e[u]),this.poolItem=H(this.poolId).then(e=>e.IsSucceeded?e.Value:void 0)):e[p]?(this.currentLayer=v.b.divisionDetailsLayer,this.divisionId=Number(e[p]),this.divisionItem=$(this.divisionId).then(e=>e.IsSucceeded?e.Value:void 0)):this.showDivisionsLayer();break;default:this.currentLayer=v.b.divisionsLayer}}else this.showDivisionsLayer();window.addEventListener("popstate",this.popstateChangeHandler.bind(this))}render(){return n.qy`
            ${this.layerTemplate()}
            ${this.modalTemplate()}  
        `}layerTemplate(){return this.pushDivisionPageHistoryState(),n.qy`
            ${(0,l.S)(this.currentLayer,[[v.b.divisionsLayer,()=>this.divisionsLayerTemplate()],[v.b.divisionDetailsLayer,()=>this.divisionDetailsLayerTemplate()],[v.b.poolDetailsLayer,()=>this.divisionPoolLayerTemplate()]],()=>n.qy`<error-plug></error-plug>`)}
        `}divisionsLayerTemplate(){return async function(){const{DivisionsLayer:e}=await i.e(563).then(i.bind(i,8563));(0,s.X)(o.I.divisionsLayer,e)}(),n.qy`
            <divisions-layer
                .divisions=${this.divisions}
                @modifyDivision=${this.modifyDivisionHandler}
                @chooseDivision=${this.chooseDivisionHandler}
            ></divisions-layer>
        `}divisionDetailsLayerTemplate(){return async function(){const{DivisionDetailsLayer:e}=await i.e(230).then(i.bind(i,9230));(0,s.X)(o.I.divisionDetailsLayer,e)}(),n.qy`
            ${(0,k.T)(this.divisionDetailsBreadcrumbsTemplate(),n.s6)}

            <division-details-layer
                .divisionItem=${Promise.resolve(this.divisionItem)}
                @assignUsers=${this.assignUsersHandler}
                @updateManagers=${this.updateManagersHandler}
                @modifyPool=${this.modifyPoolHandler}
                @choosePool=${this.choosePoolHandler}
            ></division-details-layer>
        `}divisionPoolLayerTemplate(){return async function(){const{PoolDetailsLayer:e}=await i.e(843).then(i.bind(i,6843));(0,s.X)(o.I.poolDetailsLayer,e)}(),n.qy`
            ${(0,k.T)(this.poolDetailsBreadcrumbsTemplate(),n.s6)}
            
            <pool-details-layer
                .poolItem=${this.poolItem}
                @userTableIconClick=${this.poolUserTableIconClickHandler}
                @assignUsersButtonClick=${this.assignUsersHandler}
                @editPoolButtonClick=${this.modifyPoolHandler}
            ></pool-details-layer>
        `}async divisionDetailsBreadcrumbsTemplate(){return Promise.resolve(this.divisionItem).then(e=>e?n.qy`
                        <p class='breadCrumbs'>
                            <a href='#' @click=${this.goToDivisionsLayer.bind(this)}>Divisions</a>
                            >>
                            <span>
                                <span class='entityName'>${e.Name}</span> division details
                            </span>
                        </p>
                    `:n.s6)}async poolDetailsBreadcrumbsTemplate(){return Promise.resolve(this.poolItem).then(e=>e?n.qy`
                        <p class='breadCrumbs'>
                            <a href='#' @click=${this.goToDivisionsLayer.bind(this)}>Divisions</a>
                            >>
                            <a href='#' @click=${this.goToDivisionDetailsLayer.bind(this)}>
                                <span class='entityName'>${e.DivisionName}</span> division details
                            </a>
                            >>
                            <span>
                                <span class='entityName'>${e.Name}</span> pool details
                            </span>
                        </p>
                    `:n.s6)}modalTemplate(){return n.qy`
            ${(0,l.S)(this.currentPopup,[[r.modifyDivision,()=>(async function(){(0,s.X)(o.I.modifyDivisionPopup,P)}(),n.qy`
                        <modify-division-popup
                            ?visible=${this.isPopupVisible}
                            ${(0,c.K)(this.modifyDivisionPopup)}
                        ></modify-division-popup>
                    `)],[r.modifyPool,()=>(async function(){(0,s.X)(o.I.modifyPoolPopup,O)}(),n.qy`
                        <modify-pool-popup
                            ?visible=${this.isPopupVisible}
                            ${(0,c.K)(this.modifyPoolPopup)}
                        ></modify-pool-popup>
                    `)],[r.assignUsers,()=>((0,N.l8)(),n.qy`
                        <assign-users-popup
                            ?visible=${this.isPopupVisible}
                            ${(0,c.K)(this.assignUsersPopup)}
                            @filterButtonClickEvent=${this.filterButtonClickEventHandler}
                        ></assign-users-popup>
                    `)],[r.editPoolUser,()=>(async function(){(0,s.X)(o.I.editPoolUserPopup,M)}(),n.qy`
                        <edit-pool-user-popup
                            ?visible=${this.isPopupVisible}
                            ${(0,c.K)(this.editPoolUserPopup)}
                        ></edit-pool-user-popup>
                    `)],[r.updateManagers,()=>(async function(){(0,s.X)(o.I.updateDivisionManagersPopup,F)}(),n.qy`
                        <update-division-managers-popup
                            ?visible=${this.isPopupVisible}
                            ${(0,c.K)(this.updateDivisionManagersPopup)}
                        ></update-division-managers-popup>
                    `)]],()=>n.qy``)}
        `}showDivisionsLayer(){this.currentLayer=v.b.divisionsLayer,this.divisions=this.getDivisions()}updateManagersHandler(){this.updateManagers()}modifyDivisionHandler(e){const{divisionItem:t,mode:i}=e.detail;this.modifyDivision(i,t)}chooseDivisionHandler(e){this.chooseDivisionItem(e.detail.divisionItem)}choosePoolHandler(e){this.choosePoolItem(e.detail.poolItem)}modifyPoolHandler(e){const{poolItem:t,mode:i}=e.detail;this.modifyPool(i,t)}assignUsersHandler(e){this.assignUser(e.detail.mode)}filterButtonClickEventHandler(e){const{mode:t}=e.detail,i=this.assignUsersPopup.value;i&&(i.filteredUsers=this.getFilteredUsers(t,i))}poolUserTableIconClickHandler(e){const{mode:t,userItem:i}=e.detail;this.updatePoolUser(t,i)}async updateManagers(){this.currentPopup=r.updateManagers,await this.updateComplete;const e=this.updateDivisionManagersPopup.value;if(e&&this.divisionId){e.divisionId=this.divisionId,e.possibleDivisionManagers=this.getPossibleManagers(this.divisionId);const t=await this.getPopupResponse(e);t.IsSucceeded&&await Promise.resolve(this.divisionItem).then(e=>{t.Managers&&e&&(this.divisionItem={...e,Managers:[...t.Managers]})})}}async modifyDivision(e,t){this.currentPopup=r.modifyDivision,await this.updateComplete;const i=this.modifyDivisionPopup.value;if(i){i.mode=e,i.divisionItem=t;const s=await this.getPopupResponse(i);s.IsSucceeded&&await Promise.resolve(this.divisions).then(i=>{if(i){const o=Object.assign(t,s.DivisionItem),n=e=>{const t=i.findIndex(t=>t.Id===e);i[t]=o,this.divisions=[...i]};switch(e){case b.yy.CREATE:this.divisions=[...i,o];break;case b.yy.UPDATE:n(o.Id);break;case b.yy.DELETE:this.divisions=i.filter(e=>e.Id!==o.Id)}}})}}async modifyPool(e,t){this.currentPopup=r.modifyPool,await this.updateComplete;const i=this.modifyPoolPopup.value;if(i&&t.DivisionId){i.mode=e,i.poolItem=t,i.currentManagerId=t.ManagerId,e!==b.yy.DELETE&&(i.possibleManagers=this.getPossibleManagers(t.DivisionId));const s=await this.getPopupResponse(i);if(s.IsSucceeded)if(this.divisionItem)await Promise.resolve(this.divisionItem).then(i=>{const o=Object.assign(t,s.PoolItem),n=i.Pools??[];switch(e){case b.yy.CREATE:this.divisionItem={...i,Pools:[...n,o]};break;case b.yy.UPDATE:n[n.findIndex(e=>e.Id===o.Id)]=o,this.divisionItem={...i,Pools:[...n]},this.poolItem={...o};break;case b.yy.DELETE:this.divisionItem={...i,Pools:n.filter(e=>e.Id!==o.Id)}}});else if(this.poolItem){const i=Object.assign(t,s.PoolItem);e===b.yy.UPDATE&&(this.poolItem={...i})}}}async assignUser(e){this.currentPopup=r.assignUsers,await this.updateComplete;const t=this.assignUsersPopup.value;if(t&&this.divisionId){switch(t.mode=e,e){case N.ks.assignIntoDivision:t.currentId=this.divisionId,t.selectableBranches=this.getBranchesNamesList(),t.selectableDivisions=this.getDivisionsNamesList();break;case N.ks.assignIntoPool:this.poolId&&(t.currentId=this.poolId),t.selectablePools=this.getPoolsNamesList(this.divisionId)}if(t.filteredUsers=this.getFilteredUsers(e,t),(await this.getPopupResponse(t)).IsSucceeded)switch(e){case N.ks.assignIntoDivision:this.divisionId&&(this.divisionItem=$(this.divisionId).then(e=>e.IsSucceeded?e.Value:void 0));break;case N.ks.assignIntoPool:this.poolId&&(this.poolItem=H(this.poolId).then(e=>e.IsSucceeded?e.Value:void 0))}}}async updatePoolUser(e,t){this.currentPopup=r.editPoolUser,await this.updateComplete;const i=this.editPoolUserPopup.value;if(i){i.userItem=t;const s=await this.getPopupResponse(i);s.IsSucceeded&&await Promise.resolve(this.poolItem).then(i=>{if(i&&i.Users){const o=Object.assign(t,s.UserItem);e===b.yy.UPDATE&&(i.Users[i.Users.findIndex(e=>e.Id===o.Id)]=o,this.poolItem={...i})}})}}async getDivisions(){return async function(){const e=v.C.GET_ALL_DIVISIONS,t=b.WT.POST;return(0,m.b)({url:e,method:t})}().then(e=>e.IsSucceeded&&e.Value?e.Value:void(this.currentLayer=void 0))}async getDivisionsNamesList(){return async function(){const e=v.C.GET_DIVISIONS_NAMES_LIST,t=b.WT.POST;return(0,m.b)({url:e,method:t})}().then(e=>e.IsSucceeded&&e.Value?e.Value:void 0)}async getBranchesNamesList(){return async function(){const e=b.WT.POST;return(0,m.b)({url:"/BranchService.asmx/GetBranchGroupsWithBranchesList",method:e})}().then(e=>e.IsSucceeded&&e.Value?e.Value:void 0)}async getPoolsNamesList(e){return async function(e){const t={divisionId:e},i=b.WT.POST;return(0,m.b)({url:"/ResourcePoolService.asmx/GetActiveShortByDivisionId",data:t,method:i})}(e).then(e=>e.IsSucceeded&&e.Value?e.Value:void 0)}async getPossibleManagers(e){return async function(e){const t=R.O.GET_POSSIBLE_MANAGERS,i={divisionId:e},s=b.WT.POST;return(0,m.b)({url:t,data:i,method:s})}(e).then(e=>e.IsSucceeded&&e.Value?e.Value:void 0)}async getFilteredUsers(e,t){let i;if(t&&this.divisionId)switch(e){case N.ks.assignIntoDivision:i=await this.getUsersByBranch(t.selectedBranchOption,t.selectedDivisionOption,this.divisionId);break;case N.ks.assignIntoPool:this.poolId&&(i=await this.getUsersByPool(t.selectedPoolOption,this.divisionId,this.poolId))}return i?i.map(e=>({...e,Checked:!1,AssignedStartDate:""})):void 0}async getUsersByBranch(e,t,i){return async function(e,t,i){const s=R.O.GET_NOT_ASSIGNED_USER_BY_BRANCH_AND_DIVISION,o={assignedDivisionId:i,branchId:e,divisionId:t},n=b.WT.POST;return(0,m.b)({url:s,data:o,method:n})}(e,t,i).then(e=>e.IsSucceeded&&e.Value?e.Value:void 0)}async getUsersByPool(e,t,i){return async function(e,t,i){const s=R.O.GET_NOT_ASSIGNED_USER_BY_POOL_AND_DIVISION,o={assignedPoolId:i,poolId:e,divisionId:t},n=b.WT.POST;return(0,m.b)({url:s,data:o,method:n})}(e,t,i).then(e=>e.IsSucceeded&&e.Value?e.Value:void 0)}async getPopupResponse(e){return await new Promise(t=>{this.isPopupVisible=!0;const i=s=>{const o=s.detail;t(o),this.isPopupVisible=!1,this.currentPopup=void 0,e.removeEventListener(e.RESULT_EVENT_NAME,i)};e.addEventListener(e.RESULT_EVENT_NAME,i)})}async chooseDivisionItem(e){this.divisionId=e.Id,this.currentLayer=v.b.divisionDetailsLayer,this.divisionItem=$(e.Id).then(e=>e.IsSucceeded?e.Value:void 0)}choosePoolItem(e){this.poolItem=H(e.Id).then(e=>e.IsSucceeded?e.Value:void 0),this.poolId=e.Id,this.currentLayer=v.b.poolDetailsLayer}pushDivisionPageHistoryState(){this.currentLayer&&this.currentLayer!==this.previousLayer&&(this.previousLayer=this.currentLayer,function({layer:e,divisionId:t,poolId:i}){const s={layer:e,divisionId:t,poolId:i};let o=`?${b.iX}=${e}`;t&&(o+=`&${p}=${t}`),i&&(o+=`&${u}=${i}`),history.pushState(s,"",o)}({layer:this.currentLayer,divisionId:this.divisionId,poolId:this.poolId}))}}G.styles=n.AH`
        ${a}
    `,j([(0,d.wk)()],G.prototype,"currentLayer",void 0),j([(0,d.wk)()],G.prototype,"currentPopup",void 0),j([(0,d.wk)()],G.prototype,"divisions",void 0),j([(0,d.wk)()],G.prototype,"divisionItem",void 0),j([(0,d.wk)()],G.prototype,"poolItem",void 0),j([(0,d.wk)()],G.prototype,"divisionId",void 0),j([(0,d.wk)()],G.prototype,"poolId",void 0),j([(0,d.wk)()],G.prototype,"isPopupVisible",void 0),(0,s.X)(o.I.divisionsPage,G)},2828(e,t,i){i.d(t,{CM:()=>r,P2:()=>n,dE:()=>d,gp:()=>o,rb:()=>s,tE:()=>a});const s=-1,o=1,n=0,a=10,r=".asmx",d=200},3757(e,t,i){function s(e,t){Boolean(void 0===customElements.get(e))&&customElements.define(e,t)}i.d(t,{X:()=>s})},3386(e,t,i){function s(e){if(!e)return null;const t=(e=e.replace(/(^\s+)|(\s+$)/g,"")).match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);if(null===t)return null;const i=Number(t[1]),s=Number(t[2]),o=Number(t[3]);return s<1||s>12||i<1||i>31?null:4!==s&&6!==s&&9!==s&&11!==s||31!==i?2===s&&(i>29||29===i&&(o%4!=0||o%100==0&&o%400!=0))?null:new Date(Date.UTC(o,s-1,i)):null}i.d(t,{U:()=>s})},6388(e,t,i){i.d(t,{JF:()=>a,Rb:()=>n,e9:()=>s,mk:()=>o});const s="Sorry, request failed",o="Unknown error",n="Sorry, something went wrong",a="Nothing to display"},7843(e,t,i){var s;i.d(t,{I:()=>s}),function(e){e.icebergButton="iceberg-button",e.icebergCheckbox="iceberg-checkbox",e.icebergRadioButton="iceberg-radio-button",e.icebergInput="iceberg-input",e.icebergInputFielset="iceberg-input-fieldset",e.icebergSelect="iceberg-select",e.icebergTable="iceberg-table",e.icebergTableHeader="iceberg-table-header",e.icebergTableFooter="iceberg-table-footer",e.icebergTableBody="iceberg-table-body",e.icebergPopup="iceberg-popup",e.icebergLoader="iceberg-loader",e.pageLoader="page-loader",e.errorPlug="error-plug",e.modifyDivisionPopup="modify-division-popup",e.updateDivisionManagersPopup="update-division-managers-popup",e.modifyPoolPopup="modify-pool-popup",e.editPoolUserPopup="edit-pool-user-popup",e.assignUsersPopup="assign-users-popup",e.assignUsersPopupTable="assign-users-popup-table",e.removeProjectPopup="remove-project-popup",e.icebergCalendar="iceberg-calendar",e.icebergDateField="iceberg-date-field",e.icebergDateInput="iceberg-date-input",e.icebergLogo="iceberg-logo",e.icebergCopyright="iceberg-copyright",e.icebergSearchField="iceberg-search-field",e.icebergQuickSearch="iceberg-quick-search",e.icebergProjectTaskSelect="iceberg-project-taks-select",e.icebergMultipleSelect="iceberg-multiple-select",e.icebergLegend="iceberg-legend",e.accountsTable="accounts-table",e.projectsTable="projects-table",e.divisionsTable="divisions-table",e.searchedDivisionsTable="searched-divisions-table",e.managersTable="managers-table",e.poolsTable="pools-table",e.usersTable="users-table",e.usersAssignedIntoDivisionTable="users-assigned-into-division-table",e.usersAssignedIntoPoolTable="users-assigned-into-pool-table",e.techResourcesReportTable="tech-resources-report-table",e.divisionsPage="divisions-page",e.divisionsLayer="divisions-layer",e.divisionDetailsLayer="division-details-layer",e.poolDetailsLayer="pool-details-layer",e.reportTechResorcesPage="report-tech-resources-page",e.searchPage="search-page"}(s||(s={}))},8029(e,t,i){var s,o,n,a,r;i.d(t,{$5:()=>a,Bk:()=>n,WT:()=>o,iX:()=>d,yy:()=>r}),function(e){e.FLS="FirstLineSoftware",e.FK="FormatKoda"}(s||(s={})),function(e){e.POST="POST",e.GET="GET",e.PUT="PUT",e.DELETE="DELETE"}(o||(o={})),function(e){e.FROM_SERVICE="fromService",e.FROM_API="fromApi"}(n||(n={})),function(e){e[e.SUCCESS=0]="SUCCESS",e[e.BUSINESS_ERROR=1]="BUSINESS_ERROR",e[e.MODEL_VALIDATION_ERROR=2]="MODEL_VALIDATION_ERROR",e[e.ENTITY_NOT_FOUND=3]="ENTITY_NOT_FOUND",e[e.SERVER_ERROR=4]="SERVER_ERROR"}(a||(a={})),function(e){e.CREATE="Create",e.READ="Read",e.UPDATE="Update",e.DELETE="Delete"}(r||(r={}));const d="mode"},581(e,t,i){i.d(t,{bf:()=>d,Yo:()=>r,Rx:()=>u});var s=i(3757),o=i(6161);const n=o.AH`button{min-width:100px;padding:0;cursor:pointer;transition:box-shadow ease .25s;text-align:center;border:1px solid transparent;border-radius:6px;background-color:rgba(0,0,0,0)}button:disabled{background-color:#dfdfdf;border-color:rgba(240,240,240,.5);color:#999;cursor:default}button:not(:disabled):hover{box-shadow:0 3px 10px 3px rgba(0,84,165,.5)}button:not(:disabled):active{transform:translateY(-2px)}.primary{color:#fff;background-color:#0054a5}.outlined{color:#0054a5;border:1px solid #0054a5;background-color:#fff}.md{padding:7.5px;font-size:14px;line-height:25px}.sm{padding:5px;font-size:12px;line-height:22px}.xs{padding:2.5px;font-size:10px;line-height:15px}.xxs{min-width:30px;padding:2.5px;font-size:10px;line-height:15px}@media(max-width:768px){button.md{min-height:44px;padding:10px 14px}button.sm,button.xs,button.xxs{min-height:40px;min-width:44px;padding:8px 12px}}@media(max-width:480px){button{min-width:0}button.md{min-width:0}button.sm,button.xs,button.xxs{min-width:36px;padding:6px 8px}}`;var a=i(2745);const r={PRIMARY:"primary",OUTLINED:"outlined"},d={MD:"md",SM:"sm",XS:"xs",XXS:"xxs"};var l=i(302),c=function(e,t,i,s){var o,n=arguments.length,a=n<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,s);else for(var r=e.length-1;r>=0;r--)(o=e[r])&&(a=(n<3?o(a):n>3?o(t,i,a):o(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};class h extends o.WF{constructor(){super(...arguments),this.type=r.PRIMARY,this.size=d.SM,this.disabled=!1}render(){return o.qy`
            <button
                type='button'
                class='${this.type} ${this.size}'
                ?disabled=${this.disabled}
            >
                ${(0,l.z)(this.text,()=>o.qy`${this.text}`,()=>o.qy`<slot></slot>`)}
            </button>
        `}}h.styles=o.AH`
        ${n}
    `,c([(0,a.MZ)({type:String,attribute:!1})],h.prototype,"type",void 0),c([(0,a.MZ)({type:String,attribute:!1})],h.prototype,"size",void 0),c([(0,a.MZ)({type:Boolean})],h.prototype,"disabled",void 0),c([(0,a.MZ)({type:String})],h.prototype,"text",void 0);var p=i(7843);function u(){(0,s.X)(p.I.icebergButton,h)}},9875(e,t,i){i.d(t,{Qe:()=>c,nJ:()=>h});var s=i(3757),o=i(7843),n=i(6161);const a=n.AH`input{box-sizing:border-box;display:block;width:100%;height:var(--height-md,25px);padding:var(--iceberg-input-padding,2px 10px);font-size:12px;line-height:22px;color:#333;border:1px solid #0054a5;appearance:none}input::placeholder{color:#666;font-size:12px}input:focus{outline:1px solid #51b6f6}input:hover{outline:1px solid rgba(81,182,246,.5)}input[disabled]{cursor:default;color:#999;background-color:rgba(240,240,240,.5);text-decoration:none}input[disabled]:focus,input[disabled]:hover{outline:0}`;var r=i(2745),d=i(31),l=function(e,t,i,s){var o,n=arguments.length,a=n<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,s);else for(var r=e.length-1;r>=0;r--)(o=e[r])&&(a=(n<3?o(a):n>3?o(t,i,a):o(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};class c extends n.WF{constructor(){super(...arguments),this.placeholder="",this.type="text",this.value="",this.VALUE_CHANGE_EVENT="valueChange",this.INPUT_VALUE_EVENT="valueInput",this.FOCUS_EVENT="inputFocus",this.BLUR_EVENT="inputBlur"}render(){return n.qy`
            <input
                type=${this.type}
                .value=${this.value}
                @input=${this.onInputHandler}
                @focus=${this.onFocusHandler}
                @blur=${this.onBlurHandler}
                placeholder=${this.placeholder}
                ?disabled=${this.disabled}
                @change = ${this.onChangeHandler}
                maxlength=${(0,d.J)(this.maxLength?this.maxLength:void 0)}
            />
        `}onInputHandler(e){const t=e.target;this.value=t.value;const i={input:t,value:t.value},s=new CustomEvent(this.INPUT_VALUE_EVENT,{detail:i,bubbles:!0,composed:!0});this.dispatchEvent(s)}onChangeHandler(e){const t=e.target;this.value=t.value;const i={input:t,value:t.value},s=new CustomEvent(this.VALUE_CHANGE_EVENT,{detail:i,bubbles:!0,composed:!0});this.dispatchEvent(s)}onFocusHandler(){const e=new Event(this.FOCUS_EVENT,{bubbles:!0,composed:!0});this.dispatchEvent(e)}onBlurHandler(){const e=new Event(this.BLUR_EVENT,{bubbles:!0,composed:!0});this.dispatchEvent(e)}}function h(){(0,s.X)(o.I.icebergInput,c)}c.styles=n.AH`
        ${a}
    `,l([(0,r.MZ)({type:String,attribute:!1})],c.prototype,"placeholder",void 0),l([(0,r.MZ)({type:String,attribute:!1})],c.prototype,"type",void 0),l([(0,r.MZ)({type:String,attribute:!1})],c.prototype,"value",void 0),l([(0,r.MZ)({type:Boolean})],c.prototype,"disabled",void 0),l([(0,r.MZ)({type:Number})],c.prototype,"maxLength",void 0)},8006(e,t,i){i.d(t,{S:()=>c}),i(7843);var s=i(6161);const o=s.AH`.popup{box-sizing:border-box;display:flex;flex-direction:column;align-items:stretch;justify-content:space-between;padding:3px;min-width:0;max-width:100%;max-height:80vh;margin:30px;border:3px solid #999;background:#fff;z-index:1000;opacity:0;transition:.3s all}.modal{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;z-index:1;opacity:0;pointer-events:none;transition:.3s all;overflow:hidden}.modal.narrow .popup{max-width:395px}.overlay{position:fixed;inset:0;background:hsla(0,0%,60%,.5)}.modal.visible{opacity:1;pointer-events:all}.modal.invisible{display:none}.modal.visible .popup{opacity:1}header{padding:10px 20px;font-weight:700;background-color:#0054a5;color:#fff;font-size:14px}main{flex-grow:1;padding:10px 0 0}.centered{display:flex;align-items:center;justify-content:center;padding:10px 0 0}footer{display:flex;flex-direction:column;align-items:stretch}footer .bottomRow{display:flex;align-items:center;justify-content:space-between;padding:0;border:0;text-align:right}footer div{display:flex;align-items:center;justify-content:center}footer iceberg-button{margin:0 0 0 5px}.note{color:#0054a5}.success{color:#37b629}.error{color:red}p{margin:0;line-height:18px;font-size:12px}ul{margin:0;padding:0 10px;list-style:none}li{border-bottom:1px solid #d3d3d3}.form{display:flex;flex-direction:column;align-items:flex-start}.fieldset{display:flex;align-items:center;padding:5px 20px;border-top:0}.fieldset label{width:125px;padding:0 0 0 5px;margin:0 5px 0 0;cursor:pointer}.fieldset p{padding:0 0 0 5px}.fieldset>iceberg-input,.fieldset>iceberg-select,.fieldset>textarea{width:220px}.requiredFieldset>label{position:relative}.requiredFieldset>label::before{content:"*";position:absolute;top:0;left:0;color:red}.checkboxFieldset{flex-direction:row-reverse;margin:0 0 0 135px}.checkboxFieldset>label{width:auto;padding:3px 0 3px 10px;margin:0}@media(max-width:768px){.modal{align-items:flex-end}.popup{width:100%;max-width:100%;max-height:min(92vh,100dvh);margin:0;border-width:2px;border-bottom:0}header{padding:10px 14px;font-size:13px}footer .bottomRow{flex-wrap:wrap;gap:8px;padding:8px}footer iceberg-button{flex:1 1 calc(50% - 8px);margin:0}.fieldset{flex-direction:column;align-items:stretch;padding:8px 14px}.fieldset label{width:auto;max-width:none;padding:0 0 4px;margin:0}.fieldset>iceberg-input,.fieldset>iceberg-select,.fieldset>textarea{width:100%;max-width:none}.checkboxFieldset{margin:0;padding:8px 14px}}@media(max-width:480px){header{padding:8px 10px;font-size:12px}footer .bottomRow{flex-direction:column;align-items:stretch}footer iceberg-button{flex:1 1 auto;width:100%}.fieldset{padding:6px 10px}}`;var n=i(2745),a=i(3720),r=i(581),d=i(8948),l=function(e,t,i,s){var o,n=arguments.length,a=n<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,s);else for(var r=e.length-1;r>=0;r--)(o=e[r])&&(a=(n<3?o(a):n>3?o(t,i,a):o(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};(0,r.Rx)(),(0,d.k)();class c extends s.WF{constructor(){super(...arguments),this.visible=!1,this.isLoading=!1,this.message="",this.isSuccess=!0,this.headerTitle="",this.MESSAGE_SHOW_TIME=5e3,this.RESULT_EVENT_NAME="popupResult",this.PREVENT_ACCIDENTAL_CLOSE_MESSAGE="if you want to close the popup click on the overlay again",this.checkKeyHandler=this.checkKey.bind(this)}connectedCallback(){super.connectedCallback(),document.addEventListener("keydown",this.checkKeyHandler)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("keydown",this.checkKeyHandler)}render(){const e={visible:this.visible,invisible:!this.visible,narrow:this.narrow};return s.qy`
            <div class="modal ${(0,a.H)(e)}">
                <div class="overlay" @click=${this.overlayClick}></div>
                <div class="popup">
                    ${this.headerTemplate()}
                    ${this.mainTemplate()}
                    ${this.footerTemplate()}
                </div>
            </div>
        `}headerTemplate(){return s.qy`
            <header>
                ${this.headerTitle}
            </header>
        `}mainTemplate(){return s.qy`
            <main>
                popup body
            </main>
        `}footerTemplate(){const e={success:this.isSuccess&&!this.isNote,error:!this.isSuccess&&!this.isNote,note:this.isNote};return s.qy`
            <footer>
                <p class=${(0,a.H)(e)}>${this.message}</p>
                <div class='bottomRow'>
                    <div>
                        ${this.isLoading?s.qy`<iceberg-loader></iceberg-loader>`:""}
                    </div>
                    <div>
                        <iceberg-button
                            .size=${r.bf.XS}
                            @click=${this.okClick}
                            ?disabled=${this.isLoading}
                        >
                            Ok
                        </iceberg-button>
                        <iceberg-button
                            .type=${r.Yo.OUTLINED}
                            .size=${r.bf.XS}
                            @click=${this.cancelClick}
                            ?disabled=${this.isLoading}
                        >
                            Cancel
                        </iceberg-button>
                    </div>
                </div>
            </footer>
        `}loaderTemplate(){return s.qy`
            <div class='centered'>
                <iceberg-loader></iceberg-loader>
            </div>
        `}cancelClick(){const e=new CustomEvent(this.RESULT_EVENT_NAME,{detail:{IsSucceeded:!1},bubbles:!0,composed:!0});this.dispatchEvent(e),this.visible=!1,this.message=""}okClick(){const e=new CustomEvent(this.RESULT_EVENT_NAME,{detail:{IsSucceeded:!0},bubbles:!0,composed:!0});this.dispatchEvent(e),this.visible=!1}overlayClick(){this.needToAskBeforeClosing?(this.needToAskBeforeClosing=!1,this.showMessage(this.PREVENT_ACCIDENTAL_CLOSE_MESSAGE,!1,!0)):this.cancelClick()}showMessage(e,t=!1,i=!1){this.isNote=i,this.isSuccess=t,this.message=e,this.resetMessage()}resetMessage(){this.timer&&clearTimeout(this.timer),this.timer=setTimeout(()=>{this.isSuccess=!0,this.message=""},this.MESSAGE_SHOW_TIME)}checkKey(e){"Escape"===e.key?this.cancelClick():"Enter"===e.key&&this.okClick()}}c.styles=s.AH`
        ${o}
    `,l([(0,n.MZ)({type:Boolean})],c.prototype,"visible",void 0),l([(0,n.wk)()],c.prototype,"isLoading",void 0),l([(0,n.wk)()],c.prototype,"message",void 0)},640(e,t,i){i.d(t,{JB:()=>u});var s=i(3757),o=i(7843),n=i(8192),a=i(8948),r=i(6161);const d=r.AH`div{position:relative}select{box-sizing:border-box;width:100%;height:25px;padding:2px 30px 2px 10px;font-size:12px;line-height:22px;color:#333;border:1px solid #0054a5;cursor:pointer;appearance:none}select:focus{outline:1px solid #51b6f6}select:hover{outline:1px solid rgba(81,182,246,.5)}select+span{position:absolute;top:6px;right:10px;width:8px;height:8px;margin:auto;border-bottom:2px solid #0054a5;border-right:2px solid #0054a5;transform:rotate(45deg);pointer-events:none}select[disabled]{cursor:default;color:#999;background-color:rgba(240,240,240,.5);text-decoration:none}select[disabled]+span{border-color:#999}`;var l=i(2745),c=i(9153),h=function(e,t,i,s){var o,n=arguments.length,a=n<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,s);else for(var r=e.length-1;r>=0;r--)(o=e[r])&&(a=(n<3?o(a):n>3?o(t,i,a):o(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};(0,a.k)();class p extends r.WF{constructor(){super(...arguments),this.disabled=!1,this.SELECTED_VALUE_CHANGE_EVENT="changeSelectedValue"}render(){return this.options?(0,n.T)(this.selectTemplate(),r.qy`<iceberg-loader></iceberg-loader>`):r.s6}async selectTemplate(){return Promise.resolve(this.options).then(e=>e.length?r.qy`
                        <div>
                            <select
                                ?disabled=${this.disabled}
                                @change=${t=>{this.changeSelectedItemHandler(t,e)}}
                            >
                                ${(0,n.T)(this.optionsTemplate(e),"")}
                            </select>
                            <span></span>
                        </div>
                    `:r.s6)}optionsTemplate(e){return(0,c.u)(e,e=>e.id,e=>e.options&&e.options.length?this.optionsGroupTemplate(e):this.optionTemplate(e))}optionTemplate(e){return r.qy`
            <option value=${e.id} ?selected=${String(e.id)===String(this.selectedOptionId)}>
                ${e.value}
            </option>
        `}optionsGroupTemplate(e){return e.options?r.qy`
                <optgroup label=${e.value}>
                    ${(0,c.u)(e.options,e=>e.id,e=>this.optionTemplate(e))}
                </optgroup>
            `:r.s6}changeSelectedItemHandler(e,t){let i;if(this.selectedOptionId=e.target.value,t.forEach(e=>{e.options&&e.options.length?e.options.forEach(e=>{String(e.id)===String(this.selectedOptionId)&&(i=e)}):String(e.id)===String(this.selectedOptionId)&&(i=e)}),i){const e={selectedOption:i},t=new CustomEvent(this.SELECTED_VALUE_CHANGE_EVENT,{detail:e,bubbles:!0,composed:!0});this.dispatchEvent(t)}}}function u(){(0,s.X)(o.I.icebergSelect,p)}p.styles=r.AH`
        ${d}
    `,h([(0,l.MZ)({type:Array})],p.prototype,"options",void 0),h([(0,l.MZ)({type:Number})],p.prototype,"selectedOptionId",void 0),h([(0,l.MZ)({type:Boolean})],p.prototype,"disabled",void 0)},7771(e,t,i){i.d(t,{Az:()=>l.A,vk:()=>l.v,MY:()=>T,jZ:()=>D});var s=i(3757),o=i(6161);const n=o.AH`:host{display:block;width:100%;max-width:100%;min-width:0;overflow-x:clip}table{width:100%;margin:0 0 10px;font-size:12px;line-height:18px;border-collapse:collapse;border:1px solid #d3d3d3;border-spacing:0}td,th{padding:8px 10px;text-align:left;vertical-align:middle;border:0}th{font-weight:700;color:#666;background-image:linear-gradient(to bottom,#f9f9f9 0,#dbdbdb 74%);box-shadow:1px 0 0 #fff inset;white-space:nowrap}th.sortable{position:relative;padding-right:25px;cursor:pointer}th.sortable::after{content:"";position:absolute;right:7px;top:0;bottom:0;margin:auto;width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-bottom:7px solid #999;transition:.5s all ease;pointer-events:none}th.sortable.asc::after{border-bottom:7px solid #5a5a5a}th.sortable.des::after{border-bottom:7px solid #5a5a5a;transform:rotate(180deg)}tbody>tr>td{border-bottom:1px solid #d3d3d3;color:#333}tbody>tr>td>a{color:#0054a5}tfoot>tr>td{font-weight:700;background-color:#eee}button{padding:0;background-color:rgba(0,0,0,0);border:0;cursor:pointer}.linkLikeButton button{color:#0054a5}.linkLikeButton button:hover{color:#0073ca}.sm{width:5%;text-align:center}.primaryButton svg{fill:#0054a5}.secondaryButton svg{fill:#cc3f3f}.additionalButton svg{fill:#30a030}.additionalButton svg:hover,.primaryButton svg:hover,.secondaryButton svg:hover{fill:#f48120}.centered{display:flex;align-items:center;justify-content:center}.textCentered{text-align:center}.inactiveLink{color:gray}.inactiveUser{background-color:#d0e0f0}@media(max-width:768px){:host{overflow-x:auto;-webkit-overflow-scrolling:touch}table{font-size:11px;line-height:16px}td,th{padding:6px 8px}th.sortable{padding-right:20px}.sm{width:auto;min-width:36px}}@media(max-width:480px){table{font-size:10px}td,th{padding:5px 6px}th{white-space:normal}.sm{min-width:32px}}`;var a=i(2745),r=i(8192),d=i(9153),l=i(3634),c=i(8948),h=i(3720),p=i(2828);function u(e,t){return!e&&t?p.rb:e&&!t?p.gp:e&&t?String(e).localeCompare(String(t)):p.P2}function b(e,t){return!e&&t||!(e instanceof Date)||e&&t&&e<t?p.rb:!t&&e||!(t instanceof Date)||e&&t&&e>t?p.gp:p.P2}function g(e,t){return!e&&0!==e&&void 0!==t||"number"!=typeof e||void 0!==e&&void 0!==t&&e<t?p.rb:void 0!==e&&void 0===t||"number"!=typeof t||void 0!==e&&void 0!==t&&e>t?p.gp:p.P2}function v(e,t){return void 0===e&&void 0!==t?p.rb:void 0!==e&&void 0===t?p.gp:void 0!==e&&void 0!==t?g(parseInt(String(e).replace("-",""),p.tE),parseInt(String(t).replace("-",""),p.tE)):p.P2}var m=i(7610);var y=i(581),f=i(31),I=i(6388),E=function(e,t,i,s){var o,n=arguments.length,a=n<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,s);else for(var r=e.length-1;r>=0;r--)(o=e[r])&&(a=(n<3?o(a):n>3?o(t,i,a):o(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};(0,c.k)(),(0,y.Rx)();class T extends o.WF{constructor(){super(...arguments),this.NOT_DEFINED_TABLE_MESSAGE=I.JF,this.tableRef=(0,m._)(),this.cellStyles={alignment:{vertical:"center",horizontal:"left",wrapText:"true"},font:{fs:10},border:{top:{style:"thin",color:{rgb:"000000"}},bottom:{style:"thin",color:{rgb:"000000"}},left:{style:"thin",color:{rgb:"000000"}},right:{style:"thin",color:{rgb:"000000"}}}},this.headerCellStyles={alignment:{...this.cellStyles.alignment,horizontal:"center"},font:{...this.cellStyles.font,bold:!0},border:{...this.cellStyles.border}}}render(){return this.preparedFunction(),this.isTableDefined()?o.qy`
                <table
                    ${(0,m.K)(this.tableRef)}
                >
                    ${this.headerTemplate()}
                    ${(0,r.T)(this.bodyTemplate(),this.loaderTemplate())}
                    ${this.footerTemplate()}                
                </table>

                ${this.canBeExported?o.qy`
                            <iceberg-button
                                @click=${()=>this.exportToExcellButtonClickHandler()}
                            >
                                Export to excel
                            </iceberg-button>
                        `:o.s6}
            `:this.NOT_DEFINED_TABLE_MESSAGE}headerTemplate(){return o.qy`
            <thead>
                <tr>
                    ${this.headerCells.map((e,t)=>this.headerCellTemplate(e,t))}
                </tr>
            </thead>
        `}async bodyTemplate(){return await Promise.resolve(this.displayedEntities).then(async e=>e&&e.length?(this.bodyRows=this.convertEntitiesIntoRows(e),o.qy`
                        <tbody>
                            ${(0,d.u)(this.bodyRows,e=>e.id,e=>o.qy`
                                        <tr>
                                            ${e.row.map(e=>this.cellTemplate(e))}
                                        </tr>
                                    `)}
                        </tbody>
                    `):(this.displayedEntities=void 0,o.s6))}footerTemplate(){return this.footerCells?o.qy`
                <tfoot>
                    <tr>
                        ${this.footerCells.map(e=>this.cellTemplate(e))}
                    </tr>
                </tfoot>
            `:o.s6}headerCellTemplate(e,t){const i=e.classes?e.classes:[],s={sortable:Boolean(e.sortMode),asc:this.sortOptions&&this.sortOptions.sortingCell===e&&this.sortOptions.sortByAsc,des:this.sortOptions&&this.sortOptions.sortingCell===e&&!this.sortOptions.sortByAsc};return i.forEach(e=>{s[e]=!0}),o.qy`
            <th
                class='${(0,h.H)(s)}'
                data-z=${this.canBeExported?JSON.stringify(this.headerCellStyles):o.s6}
                @click=${e.sortMode?()=>this.sortRows(e,t):o.s6}
            >
                ${e.content?e.content:""}
            </th>
        `}cellTemplate(e){return o.qy`
            <td
                colspan=${(0,f.J)(e.colspan)}
                class=${(0,f.J)(e.classes?e.classes.join(" "):void 0)}
                data-z=${this.canBeExported?JSON.stringify(this.cellStyles):o.s6}
            >
                ${e.content?e.content:""}
            </td>
        `}loaderTemplate(){return o.qy`
            <tbody>
                <tr>
                    <td colspan=${this.headerCells.length} class=${l.A.TEXT_CENTERED}>
                        <iceberg-loader></iceberg-loader>
                    </td>
                </tr>
            </tbody>
        `}addEntityItemRow(e){Promise.resolve(this.displayedEntities).then(t=>{t&&(this.displayedEntities=[...t,e])})}editTableItemRow(e){Promise.resolve(this.displayedEntities).then(t=>{if(t){const i=t.findIndex(t=>t.Id===e.Id);t[i]=e,this.displayedEntities=[...t]}})}removeTableRow(e){Promise.resolve(this.displayedEntities).then(t=>{t&&(this.displayedEntities=t.filter(t=>t.Id!==e.Id))})}isTableDefined(){return Boolean(this.headerCells&&this.displayedEntities)}convertEntitiesIntoRows(e){let t=e.map(e=>this.convertEntityFunction(e));if(this.sortOptions){let e;switch(this.sortOptions.sortingCell.sortMode){case l.v.AS_STRING:e=u;break;case l.v.AS_DATES:e=b;break;case l.v.AS_NUMBERS:e=g;break;case l.v.AS_1C_ID:e=v;break;default:e=u}t=t.sort((t,i)=>{const s=t.row[this.sortOptions.indexCellSortingBy].compareContent?t.row[this.sortOptions.indexCellSortingBy].compareContent:t.row[this.sortOptions.indexCellSortingBy].content,o=i.row[this.sortOptions.indexCellSortingBy].compareContent?i.row[this.sortOptions.indexCellSortingBy].compareContent:i.row[this.sortOptions.indexCellSortingBy].content;return e(s,o)}),this.sortOptions.sortByAsc||(t=t.reverse())}return t}sortRows(e,t){const i={indexCellSortingBy:t,sortingCell:e,sortByAsc:!this.sortOptions||this.sortOptions.indexCellSortingBy!==t||!this.sortOptions.sortByAsc};this.sortOptions={...i}}exportToExcellButtonClickHandler(){!async function(e,t=!0,i="Table",s=1){e.tableRef.value;const o={},n=[],a=[...e.headerCells.map(e=>({wpx:e.wpx}))],r=await Promise.resolve(e.displayedEntities).then(e=>e?e.length:null);if(r){for(let e=0;e<s;e++)n.push({hpx:15});for(let e=0;e<r;e++)n.push({hpx:15});for(const e in o)o[e].z&&(o[e].s=JSON.parse(o[e].z),delete o[e].z),o[e].v||o[e]instanceof Object&&(o[e].t="s");o["!cols"]=a,o["!rows"]=n,(new Date).toLocaleDateString("de-DE",{year:"2-digit",month:"2-digit",day:"2-digit"}),console.warn("Excel export is disabled in demo mode")}}(this)}preparedFunction(){return o.s6}}T.styles=o.AH`
        ${n}
    `,E([(0,a.MZ)({type:Object,reflect:!1,attribute:!1})],T.prototype,"displayedEntities",void 0),E([(0,a.MZ)({type:Boolean})],T.prototype,"canBeExported",void 0),E([(0,a.wk)()],T.prototype,"sortOptions",void 0);var x=i(7843);function D(){(0,s.X)(x.I.icebergTable,T)}},3634(e,t,i){var s,o;i.d(t,{A:()=>o,v:()=>s}),function(e){e.AS_STRING="asString",e.AS_DATES="asDates",e.AS_NUMBERS="asNumbers",e.AS_1C_ID="as1CId"}(s||(s={})),function(e){e.PRIMARY_BUTTON="primaryButton",e.SECONDARY_BUTTON="secondaryButton",e.ADDITIONAL_BUTTON="additionalButton",e.SM="sm",e.LINK_LIKE_BUTTON="linkLikeButton",e.CENTERED="centered",e.TEXT_CENTERED="textCentered",e.INACTIVE_ENTITY_LINK="inactiveLink",e.INACTIVE_USER="inactiveUser"}(o||(o={}))},8948(e,t,i){i.d(t,{k:()=>a});var s=i(3757),o=i(7843),n=i(2149);function a(){(0,s.X)(o.I.icebergLoader,n.H)}},2149(e,t,i){i.d(t,{H:()=>a});var s=i(6161),o=i(2745);const n=s.AH`span{width:18px;height:18px;border:2px solid #0054a5;border-bottom-color:transparent;border-radius:50%;display:inline-block;box-sizing:border-box;animation:rotation 1s linear infinite}@keyframes rotation{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}`;class a extends s.WF{constructor(){super(...arguments),this.big=!1}render(){return s.qy`
            <span></span>
        `}}a.styles=s.AH`
        ${n}
    `,function(e,t,i,s){var o,n=arguments.length,a=n<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,s);else for(var r=e.length-1;r>=0;r--)(o=e[r])&&(a=(n<3?o(a):n>3?o(t,i,a):o(t,i))||a);n>3&&a&&Object.defineProperty(t,i,a)}([(0,o.MZ)({type:Boolean})],a.prototype,"big",void 0)},3978(e,t,i){i.d(t,{b:()=>d});var s=i(4166),o=i(2828),n=i(6388),a=i(8029),r=i(856);async function d({url:e,method:t,params:i,data:d={}}){const l={IsSucceeded:!1,Message:n.e9},c=function(e){return e.includes(o.CM)?a.Bk.FROM_SERVICE:a.Bk.FROM_API}(e);return e=c===a.Bk.FROM_API?e:`/divisions/Services${e}`.replace(/\/{2,}/g,"/"),await(0,s.A)({method:t,url:e,headers:{"Content-Type":"application/json; charset=utf-8"},data:d,params:i}).then(t=>{if(t.status===o.dE)switch(function(e,t={}){e.includes("GetDetailsById")?(0,r.h)("division_open",{divisionId:Number(t.divisionId??0)}):(e.includes("AddUsersDivisionHistoryEntries")||e.includes("AddUsersPoolHistoryEntries"))&&(0,r.h)("user_assign",{divisionId:Number(t.divisionId??0),poolId:Number(t.poolId??0),count:Array.isArray(t.users)?t.users.length:Array.isArray(t.userIds)?t.userIds.length:0})}(e,{...d,...i}),c){case a.Bk.FROM_SERVICE:return async function(e){const t={IsSucceeded:!1,Message:n.e9},i=e.data;return i&&i.d&&(t.IsSucceeded=i.d.IsSucceeded||!1,t.IsSucceeded?t.Value=i.d.Value??void 0:t.Message=i.d.Message||n.e9),t}(t);case a.Bk.FROM_API:return async function(e){const t={IsSucceeded:!1,Message:n.e9},i=e.data;return i&&(t.IsSucceeded=i.RequestResult===a.$5.SUCCESS,t.IsSucceeded?t.Value=i.Data??void 0:t.Message=i.Message||n.e9),t}(t);default:return l}throw new Error}).catch(()=>l)}}}]);