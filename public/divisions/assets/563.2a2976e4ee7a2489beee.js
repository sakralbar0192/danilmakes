/*! For license information please see 563.2a2976e4ee7a2489beee.js.LICENSE.txt */
"use strict";(self.webpackChunkdivisions_demo=self.webpackChunkdivisions_demo||[]).push([[563],{655(t,e,i){i.d(e,{A:()=>o});const o=i(4420).JW`<svg height="20" width="20" viewBox="0 0 98 137" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <path d="M75.6,44.8v73c0,3.4-2.8,6.2-6.2,6.2H21.3c-3.4,0-6.2-2.8-6.2-6.2v-73H75.6L75.6,44.8z M59.9,52.9v62.8h3.6V52.9H59.9  L59.9,52.9z M43.6,52.9v62.8h3.6V52.9H43.6L43.6,52.9z M27.3,52.9v62.8h3.6V52.9H27.3L27.3,52.9z M31.3,27.9v-5.2  c0-3.3,2.6-5.9,5.9-5.9h16.4c3.3,0,5.9,2.6,5.9,5.9v5.2h18.1c3.4,0,6.2,2.8,6.2,6.2v4.3H7V34c0-3.4,2.8-6.2,6.2-6.2H31.3L31.3,27.9z   M37.2,20.8c-1,0-1.8,0.8-1.8,1.8v5.2h20.1v-5.2c0-1-0.8-1.8-1.8-1.8H37.2L37.2,20.8z"/>
</svg>
`},5073(t,e,i){i.d(e,{A:()=>o});const o=i(4420).JW`<svg xmlns:xlink="http://www.w3.org/1999/xlink" height="16" width="16" viewBox="0 0 485.219 485.22">
    <path d="M467.476,146.438l-21.445,21.455L317.35,39.23l21.445-21.457c23.689-23.692,62.104-23.692,85.795,0l42.886,42.897
    C491.133,84.349,491.133,122.748,467.476,146.438z M167.233,403.748c-5.922,5.922-5.922,15.513,0,21.436
    c5.925,5.955,15.521,5.955,21.443,0L424.59,189.335l-21.469-21.457L167.233,403.748z M60,296.54c-5.925,5.927-5.925,15.514,0,21.44
    c5.922,5.923,15.518,5.923,21.443,0L317.35,82.113L295.914,60.67L60,296.54z M338.767,103.54L102.881,339.421
    c-11.845,11.822-11.815,31.041,0,42.886c11.85,11.846,31.038,11.901,42.914-0.032l235.886-235.837L338.767,103.54z
    M145.734,446.572c-7.253-7.262-10.749-16.465-12.05-25.948c-3.083,0.476-6.188,0.919-9.36,0.919
    c-16.202,0-31.419-6.333-42.881-17.795c-11.462-11.491-17.77-26.687-17.77-42.887c0-2.954,0.443-5.833,0.859-8.703
    c-9.803-1.335-18.864-5.629-25.972-12.737c-0.682-0.677-0.917-1.596-1.538-2.338L0,485.216l147.748-36.986
    C147.097,447.637,146.36,447.193,145.734,446.572z"/>
</svg>
`},9434(t,e,i){i.d(e,{A:()=>o});const o="user_id"},8563(t,e,i){i.d(e,{DivisionsLayer:()=>E});var o=i(6161);const n=o.AH`div{display:flex;flex-direction:column;align-items:stretch;max-width:1050px;margin:auto}div divisions-table{margin:0 0 20px}div iceberg-button{align-self:flex-end}`;var s=i(581),r=i(3757),c=i(7843),a=i(2745),d=i(7771),l=i(6312),p=i(8029),v=i(9434),h=i(655),u=i(5073);function f(t){const e=[],i=`Divisions.aspx?mode=${l.b.divisionDetailsLayer}&division_id=${t.Id}`,n={content:o.qy`
            <a
                href=${i}
                title='View division details'
                @click=${e=>{e.preventDefault();const i={divisionItem:t},o=new CustomEvent(this.CHOOSE_DIVISION_EVENT_NAME??"",{detail:i,bubbles:!0,composed:!0});this.dispatchEvent(o)}}
            >
                ${t.Name}
            </a>
        `,compareContent:t.Name},s={content:t.UserCount},r={content:t.Managers?o.qy`
            ${t.Managers.map((e,i)=>{const n=o.qy`
                            <a
                                href='UserDetails.aspx?${v.A}=${e.Id}'
                                title='View user details'
                            >
                                ${e.Name}
                            </a>
                        `;return t.Managers&&i+1===t.Managers.length?n:o.qy`${n} <br />`})}
        `:"",compareContent:t.Managers?t.Managers.map(t=>t.Name).join(" "):""},c={content:o.qy`
            <button
                type="button"
                @click=${()=>{const e={mode:p.yy.UPDATE,divisionItem:t},i=new CustomEvent(this.MODIFY_DIVISION_EVENT_NAME??"",{detail:e,bubbles:!0,composed:!0});this.dispatchEvent(i)}}
                title='Update division'
            >
                ${u.A}
            </button>
        `,classes:[d.Az.SM,d.Az.PRIMARY_BUTTON]},a={content:o.qy`
            <button
                type="button"
                @click=${()=>{const e={mode:p.yy.DELETE,divisionItem:t},i=new CustomEvent(this.MODIFY_DIVISION_EVENT_NAME??"",{detail:e,bubbles:!0,composed:!0});this.dispatchEvent(i)}}
                title='Delete division'
            >
                ${h.A}
            </button>
        `,classes:[d.Az.SM,d.Az.SECONDARY_BUTTON]};return e.push(n,s,r,c,a),{id:t.Id,row:e}}var m=function(t,e,i,o){var n,s=arguments.length,r=s<3?e:null===o?o=Object.getOwnPropertyDescriptor(e,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(t,e,i,o);else for(var c=t.length-1;c>=0;c--)(n=t[c])&&(r=(s<3?n(r):s>3?n(e,i,r):n(e,i))||r);return s>3&&r&&Object.defineProperty(e,i,r),r};(0,d.jZ)();class y extends d.MY{constructor(){super(...arguments),this.convertEntityFunction=f,this.CHOOSE_DIVISION_EVENT_NAME="chooseDivision",this.MODIFY_DIVISION_EVENT_NAME="modifyDivision",this.headerCells=[{content:"Division name",sortMode:d.vk.AS_STRING},{content:"Headcount",sortMode:d.vk.AS_NUMBERS},{content:"Managers",sortMode:d.vk.AS_STRING},{content:"",classes:[d.Az.SM]},{content:"",classes:[d.Az.SM]}]}footerTemplate(){if(this.displayedEntities){this.countTotal&&this.countTotal();const t=[{content:"Total"},{content:this.totalCount?this.totalCount:0,colspan:4}];return o.qy`
                <tfoot>
                    <tr>
                        ${t.map(t=>this.cellTemplate(t))}
                    </tr>
                </tfoot>
            `}return o.s6}async countTotal(){return await Promise.resolve(this.displayedEntities).then(t=>{if(t){const e=t.reduce((t,e)=>e.UserCount?t+e.UserCount:t,0);this.totalCount=e}})}}m([(0,a.MZ)({type:Object,reflect:!1,attribute:!1})],y.prototype,"displayedEntities",void 0),m([(0,a.wk)()],y.prototype,"totalCount",void 0);var g=i(7287),b=i(7765);(0,r.X)(c.I.divisionsTable,y),(0,s.Rx)(),(0,g.S)(),(0,b.k)();class E extends o.WF{constructor(){super(...arguments),this.MODIFY_DIVISION_EVENT_NAME="modifyDivision"}render(){return this.divisions?o.qy`
                <div>
                    <divisions-table
                        .displayedEntities=${this.divisions}
                        @modifyDivision=${this.modifyDivisionHandler}
                    ></divisions-table>
                    
                    <iceberg-button
                        @click=${this.modifyDivisionHandler}
                    >
                        Add division
                    </iceberg-button>
                </div>
            `:o.qy`<error-plug></error-plug>`}modifyDivisionHandler(t){t&&t.stopPropagation();const e={mode:t?.detail.mode||p.yy.CREATE,divisionItem:t?.detail.divisionItem||{Id:0,IsProduction:!1,Name:"",SendTimeApprovalNotifications:!1}},i=new CustomEvent(this.MODIFY_DIVISION_EVENT_NAME,{detail:e,bubbles:!0,composed:!0});this.dispatchEvent(i)}}E.styles=o.AH`
        ${n}
    `,function(t,e,i,o){var n,s=arguments.length,r=s<3?e:null===o?o=Object.getOwnPropertyDescriptor(e,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(t,e,i,o);else for(var c=t.length-1;c>=0;c--)(n=t[c])&&(r=(s<3?n(r):s>3?n(e,i,r):n(e,i))||r);s>3&&r&&Object.defineProperty(e,i,r)}([(0,a.MZ)({type:Object,attribute:!1})],E.prototype,"divisions",void 0)},7765(t,e,i){i.d(e,{k:()=>l});var o=i(3757),n=i(7843),s=i(6161);const r=s.AH`div{display:flex;align-items:center;flex-direction:column;justify-content:center;width:100%;height:100%;padding:20px}`;var c=i(2745),a=i(6388);(0,i(581).Rx)();class d extends s.WF{constructor(){super(...arguments),this.errorMessage=a.Rb,this.ADDITIONAL_MESSAGE="Try to reload this page"}render(){return s.qy`
            <div>
                <p>${this.errorMessage}</p>
                <p>${this.ADDITIONAL_MESSAGE}</p>
                <iceberg-button
                    @click=${()=>window.location.reload()}
                >
                    Reload page
                </iceberg-button>
            </div>
        `}}function l(){(0,o.X)(n.I.errorPlug,d)}d.styles=s.AH`
        ${r}
    `,function(t,e,i,o){var n,s=arguments.length,r=s<3?e:null===o?o=Object.getOwnPropertyDescriptor(e,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(t,e,i,o);else for(var c=t.length-1;c>=0;c--)(n=t[c])&&(r=(s<3?n(r):s>3?n(e,i,r):n(e,i))||r);s>3&&r&&Object.defineProperty(e,i,r)}([(0,c.MZ)()],d.prototype,"errorMessage",void 0)},7287(t,e,i){i.d(e,{S:()=>d});var o=i(3757),n=i(7843),s=i(6161),r=i(2149);const c=s.AH`div{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;width:100vw;height:100vh;background-color:hsla(0,0%,60%,.5)}span{width:60px;height:60px;border-width:4px}`;class a extends r.H{render(){return s.qy`
            <div>
                <span></span>
            </div>
        `}}function d(){(0,o.X)(n.I.pageLoader,a)}a.styles=[r.H.styles,s.AH`
          ${c}  
        `]},4420(t,e,i){i.d(e,{JW:()=>o.JW}),i(842);var o=i(6752);i(5228),i(1124),i(9896),console.warn("The main 'lit-element' module entrypoint is deprecated. Please update your imports to use the 'lit' package: 'lit' and 'lit/decorators.ts' or import from 'lit-element/lit-element.ts'. See https://lit.dev/msg/deprecated-import-path for more information.")}}]);