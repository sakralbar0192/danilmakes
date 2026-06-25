/*! For license information please see 230.96b03c38a3cd05866f73.js.LICENSE.txt */
"use strict";(self.webpackChunkdivisions_demo=self.webpackChunkdivisions_demo||[]).push([[230],{655(e,t,o){o.d(t,{A:()=>n});const n=o(4420).JW`<svg height="20" width="20" viewBox="0 0 98 137" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <path d="M75.6,44.8v73c0,3.4-2.8,6.2-6.2,6.2H21.3c-3.4,0-6.2-2.8-6.2-6.2v-73H75.6L75.6,44.8z M59.9,52.9v62.8h3.6V52.9H59.9  L59.9,52.9z M43.6,52.9v62.8h3.6V52.9H43.6L43.6,52.9z M27.3,52.9v62.8h3.6V52.9H27.3L27.3,52.9z M31.3,27.9v-5.2  c0-3.3,2.6-5.9,5.9-5.9h16.4c3.3,0,5.9,2.6,5.9,5.9v5.2h18.1c3.4,0,6.2,2.8,6.2,6.2v4.3H7V34c0-3.4,2.8-6.2,6.2-6.2H31.3L31.3,27.9z   M37.2,20.8c-1,0-1.8,0.8-1.8,1.8v5.2h20.1v-5.2c0-1-0.8-1.8-1.8-1.8H37.2L37.2,20.8z"/>
</svg>
`},5073(e,t,o){o.d(t,{A:()=>n});const n=o(4420).JW`<svg xmlns:xlink="http://www.w3.org/1999/xlink" height="16" width="16" viewBox="0 0 485.219 485.22">
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
`},9230(e,t,o){o.d(t,{DivisionDetailsLayer:()=>w});var n=o(6161);const s=n.AH`h2{margin:0 0 10px 10px;font-weight:400}.sendInfo span{font-weight:700}.section{display:flex;flex-direction:column;align-items:stretch;margin:0 0 20px;padding:16px;background:#fff;border:1px solid #e8eef3;border-radius:12px;box-shadow:0 1px 3px rgba(30,139,195,.08)}.section div{display:flex;flex-direction:column;margin:0 0 10px}.section iceberg-button{align-self:flex-end}`;var i=o(3757),r=o(7843),a=o(2745),c=o(7771),l=o(3634),d=o(6752),p=o(5073),h=o(655),u=o(8029),v=o(6312),f=o(9574);function m(e){const t=[],o=`Divisions.aspx?mode=${v.b.poolDetailsLayer}&division_id=${e.DivisionId}&pool_id=${e.Id}`,n={content:d.qy`
            <a
                href=${o}
                title='View poll details'
                @click=${t=>{t.preventDefault();const o={poolItem:e},n=new CustomEvent(this.CHOOSE_POOL_EVENT_NAME??"",{detail:o,bubbles:!0,composed:!0});this.dispatchEvent(n)}}
            >
                ${e.Name}
            </a>
        `,compareContent:e.Name},s={content:e.UserCount?e.UserCount:0},i={content:(0,f.r)(e.ManagerId??0,e.ManagerName??""),compareContent:e.ManagerName},r={content:d.qy`
            <button
                type="button"
                @click=${()=>{const t={mode:u.yy.UPDATE,poolItem:e},o=new CustomEvent(this.MODIFY_POOL_EVENT_NAME??"",{detail:t,bubbles:!0,composed:!0});this.dispatchEvent(o)}}
                title='Update pool'
            >
                ${p.A}
            </button>
        `,classes:[c.Az.SM,c.Az.PRIMARY_BUTTON]},a={content:d.qy`
            <button
                type="button"
                @click=${()=>{const t={mode:u.yy.DELETE,poolItem:e},o=new CustomEvent(this.MODIFY_POOL_EVENT_NAME??"",{detail:t,bubbles:!0,composed:!0});this.dispatchEvent(o)}}
                title='Delete pool'
            >
                ${h.A}
            </button>
        `,classes:[c.Az.SM,c.Az.SECONDARY_BUTTON]};return t.push(n,s,i,r,a),{id:e.Id,row:t}}class g extends c.MY{constructor(){super(...arguments),this.CHOOSE_POOL_EVENT_NAME="choosePool",this.MODIFY_POOL_EVENT_NAME="modifyPool",this.convertEntityFunction=m,this.headerCells=[{content:"Pool name",sortMode:l.v.AS_STRING},{content:"Headcount",sortMode:l.v.AS_NUMBERS},{content:"Manager",sortMode:l.v.AS_STRING},{content:"",classes:[c.Az.SM]},{content:"",classes:[c.Az.SM]}]}}!function(e,t,o,n){var s,i=arguments.length,r=i<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,o):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(e,t,o,n);else for(var a=e.length-1;a>=0;a--)(s=e[a])&&(r=(i<3?s(r):i>3?s(t,o,r):s(t,o))||r);i>3&&r&&Object.defineProperty(t,o,r)}([(0,a.MZ)({type:Object,reflect:!1,attribute:!1})],g.prototype,"displayedEntities",void 0);var b=o(3386);function y(e){const t=[],o={content:(0,f.r)(e.Id,e.Name??""),compareContent:e.Name},n={content:e.PoolName},s={content:e.BranchName},i={content:e.StartDate,compareContent:(0,b.U)(e.StartDate??"")??""};return t.push(o,n,s,i),{id:e.Id,row:t}}class E extends c.MY{constructor(){super(...arguments),this.convertEntityFunction=y,this.NOT_DEFINED_TABLE_MESSAGE="The user list is empty.",this.headerCells=[{content:"User name",sortMode:c.vk.AS_STRING},{content:"Pool",sortMode:c.vk.AS_STRING},{content:"Branch",sortMode:c.vk.AS_STRING},{content:"Start date",sortMode:c.vk.AS_DATES}]}}!function(e,t,o,n){var s,i=arguments.length,r=i<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,o):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(e,t,o,n);else for(var a=e.length-1;a>=0;a--)(s=e[a])&&(r=(i<3?s(r):i>3?s(t,o,r):s(t,o))||r);i>3&&r&&Object.defineProperty(t,o,r)}([(0,a.MZ)({type:Object,reflect:!1,attribute:!1})],E.prototype,"displayedEntities",void 0);var M=o(5456),A=o(8192),N=o(7287);function _(e){const t=[],o={content:(0,f.r)(e.Id,e.Name??""),compareContent:e.Name},n={content:e.BranchName};return t.push(o,n),{id:e.Id,row:t}}class S extends c.MY{constructor(){super(...arguments),this.convertEntityFunction=_,this.headerCells=[{content:"Manager name",sortMode:c.vk.AS_STRING},{content:"Branch",sortMode:c.vk.AS_STRING}],this.NOT_DEFINED_TABLE_MESSAGE="The manager list is empty."}}!function(e,t,o,n){var s,i=arguments.length,r=i<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,o):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(e,t,o,n);else for(var a=e.length-1;a>=0;a--)(s=e[a])&&(r=(i<3?s(r):i>3?s(t,o,r):s(t,o))||r);i>3&&r&&Object.defineProperty(t,o,r)}([(0,a.MZ)({type:Object,reflect:!1,attribute:!1})],S.prototype,"displayedEntities",void 0);var I=o(7765),O=o(581);!async function(){(0,i.X)(r.I.managersTable,S)}(),async function(){(0,i.X)(r.I.poolsTable,g)}(),async function(){(0,i.X)(r.I.usersAssignedIntoDivisionTable,E)}(),(0,N.S)(),(0,I.k)();class w extends n.WF{constructor(){super(...arguments),this.UPDATE_MANAGERS_EVENT_NAME="updateManagers",this.MODIFY_POOL_EVENT_NAME="modifyPool",this.ASSIGN_USERS_EVENT_NAME="assignUsers"}render(){return this.divisionItem?n.qy`${(0,A.T)(this.divisionDetailsTemplate(),n.qy`<page-loader></page-loader>`)}`:n.qy`
                <error-plug></error-plug>
            `}async divisionDetailsTemplate(){return Promise.resolve(this.divisionItem).then(e=>e?n.qy`
                        <div>
                            <p class='sendInfo'>
                                Send Time Approval notifications:
                                <span>
                                    ${e.SendTimeApprovalNotifications?"Yes":"No"} 
                                </span>
                            </p>

                            <div class='section'>
                                <h2>Managers list</h2>
                                <div>
                                    <managers-table
                                        .displayedEntities=${e.Managers}
                                    ></managers-table>
                                </div>
                                <iceberg-button
                                    .size=${O.bf.XS}
                                    @click=${this.updateManagersHandler}
                                >
                                    Update managers
                                </iceberg-button>
                            </div>

                            <div class='section'>
                                <h2>Resource pools</h2>
                                <div>
                                    <pools-table
                                        .displayedEntities=${e.Pools}
                                        @modifyPool=${this.modifyPoolHandler}
                                    ></pools-table>
                                </div>
                                <iceberg-button
                                    .size=${O.bf.XS}
                                    @click=${this.modifyPoolHandler}
                                >
                                    Add pool
                                </iceberg-button>
                            </div>

                            <div class='section'>
                                <h2>Users list</h2>
                                <div>
                                    <users-assigned-into-division-table
                                        .displayedEntities=${e.Users??[]}
                                    ></users-assigned-into-division-table> 
                                </div>
                                <iceberg-button
                                    .size=${O.bf.XS}
                                    @click=${this.assignUsersButtonClickHandler}
                                >
                                    Assign users
                                </iceberg-button>
                            </div>
                        </div>
                    `:n.qy`
                        <error-plug></error-plug>
                    `)}updateManagersHandler(){const e=new Event(this.UPDATE_MANAGERS_EVENT_NAME,{bubbles:!0,composed:!0});this.dispatchEvent(e)}async modifyPoolHandler(e){e&&e.stopPropagation(),await Promise.resolve(this.divisionItem).then(t=>{if(t){const o={mode:e?.detail.mode||u.yy.CREATE,poolItem:e?.detail.poolItem||{Id:0,Name:"",DivisionId:t.Id,ManagerId:0}},n=new CustomEvent(this.MODIFY_POOL_EVENT_NAME,{detail:o,bubbles:!0,composed:!0});this.dispatchEvent(n)}})}assignUsersButtonClickHandler(){const e={mode:M.ks.assignIntoDivision},t=new CustomEvent(this.ASSIGN_USERS_EVENT_NAME,{detail:e,bubbles:!0,composed:!0});this.dispatchEvent(t)}}w.styles=n.AH`
        ${s}
    `,function(e,t,o,n){var s,i=arguments.length,r=i<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,o):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(e,t,o,n);else for(var a=e.length-1;a>=0;a--)(s=e[a])&&(r=(i<3?s(r):i>3?s(t,o,r):s(t,o))||r);i>3&&r&&Object.defineProperty(t,o,r)}([(0,a.MZ)()],w.prototype,"divisionItem",void 0)},9574(e,t,o){o.d(t,{r:()=>s});var n=o(6752);function s(e,t,o="View user details"){return n.qy`<span class="entity-name">${t}</span>`}},7765(e,t,o){o.d(t,{k:()=>d});var n=o(3757),s=o(7843),i=o(6161);const r=i.AH`div{display:flex;align-items:center;flex-direction:column;justify-content:center;width:100%;height:100%;padding:20px}`;var a=o(2745),c=o(6388);(0,o(581).Rx)();class l extends i.WF{constructor(){super(...arguments),this.errorMessage=c.Rb,this.ADDITIONAL_MESSAGE="Try to reload this page"}render(){return i.qy`
            <div>
                <p>${this.errorMessage}</p>
                <p>${this.ADDITIONAL_MESSAGE}</p>
                <iceberg-button
                    @click=${()=>window.location.reload()}
                >
                    Reload page
                </iceberg-button>
            </div>
        `}}function d(){(0,n.X)(s.I.errorPlug,l)}l.styles=i.AH`
        ${r}
    `,function(e,t,o,n){var s,i=arguments.length,r=i<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,o):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(e,t,o,n);else for(var a=e.length-1;a>=0;a--)(s=e[a])&&(r=(i<3?s(r):i>3?s(t,o,r):s(t,o))||r);i>3&&r&&Object.defineProperty(t,o,r)}([(0,a.MZ)()],l.prototype,"errorMessage",void 0)},7287(e,t,o){o.d(t,{S:()=>l});var n=o(3757),s=o(7843),i=o(6161),r=o(2149);const a=i.AH`div{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;width:100vw;height:100vh;background-color:hsla(0,0%,60%,.5)}span{width:60px;height:60px;border-width:4px}`;class c extends r.H{render(){return i.qy`
            <div>
                <span></span>
            </div>
        `}}function l(){(0,n.X)(s.I.pageLoader,c)}c.styles=[r.H.styles,i.AH`
          ${a}  
        `]},4420(e,t,o){o.d(t,{JW:()=>n.JW}),o(842);var n=o(6752);o(5228),o(1124),o(9896),console.warn("The main 'lit-element' module entrypoint is deprecated. Please update your imports to use the 'lit' package: 'lit' and 'lit/decorators.ts' or import from 'lit-element/lit-element.ts'. See https://lit.dev/msg/deprecated-import-path for more information.")}}]);