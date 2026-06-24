/*! For license information please see 843.acf59e155f690f4f846b.js.LICENSE.txt */
"use strict";(self.webpackChunkdivisions_demo=self.webpackChunkdivisions_demo||[]).push([[843],{5073(e,t,o){o.d(t,{A:()=>s});const s=o(4420).JW`<svg xmlns:xlink="http://www.w3.org/1999/xlink" height="16" width="16" viewBox="0 0 485.219 485.22">
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
`},9434(e,t,o){o.d(t,{A:()=>s});const s="user_id"},6843(e,t,o){o.d(t,{PoolDetailsLayer:()=>T});var s=o(5456),n=o(3757),i=o(7843),r=o(7771),l=o(2745),c=o(6752),a=o(5073),d=o(8029),p=o(9434),u=o(3386);function h(e){const t=[],o={content:c.qy`
            <a
                href='UserDetails.aspx?${p.A}=${e.Id}'
                title='View user details'
            >
                ${e.Name}
            </a>
        `,compareContent:e.Name},s={content:e.BranchName},n={content:e.StartDate,compareContent:(0,u.U)(e.StartDate??"")??""},i={content:c.qy`
            <button
                type="button"
                @click=${()=>{const t={mode:d.yy.UPDATE,userItem:e},o=new CustomEvent("userTableIconClick",{detail:t,bubbles:!0,composed:!0});this.dispatchEvent(o)}}
                title='Update user pool start date'
            >
                ${a.A}
            </button>
        `,classes:[r.Az.PRIMARY_BUTTON,r.Az.SM]};return t.push(o,s,n,i),{id:e.Id,row:t}}var g=o(3634);class f extends r.MY{constructor(){super(...arguments),this.convertEntityFunction=h,this.NOT_DEFINED_TABLE_MESSAGE="The user list is empty.",this.headerCells=[{content:"User name",sortMode:g.v.AS_STRING},{content:"Branch",sortMode:g.v.AS_STRING},{content:"Start date",sortMode:g.v.AS_DATES},{content:"",classes:[r.Az.SM]}]}}!function(e,t,o,s){var n,i=arguments.length,r=i<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,o):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(e,t,o,s);else for(var l=e.length-1;l>=0;l--)(n=e[l])&&(r=(i<3?n(r):i>3?n(t,o,r):n(t,o))||r);i>3&&r&&Object.defineProperty(t,o,r)}([(0,l.MZ)({type:Object,reflect:!1,attribute:!1})],f.prototype,"displayedEntities",void 0);var v=o(6161),m=o(7287);const b=v.AH`h2{margin:0 0 10px 10px;font-weight:400}.topInfo span{font-weight:700}.section{display:flex;flex-direction:column;align-items:stretch;margin:0 0 20px}.section div{margin:0 0 10px}.editButton{text-align:right}.section iceberg-button{align-self:flex-end}`;var y=o(8192),E=o(581),A=o(7765);!async function(){(0,n.X)(i.I.usersAssignedIntoPoolTable,f)}(),(0,m.S)(),(0,E.Rx)(),(0,A.k)();class T extends v.WF{constructor(){super(...arguments),this.ASSIGN_USERS_BUTTON_CLICK_EVENT_NAME="assignUsersButtonClick",this.EDIT_POOL_BUTTON_CLICK_EVENT_NAME="editPoolButtonClick"}render(){return this.poolItem?v.qy`${(0,y.T)(this.poolDetailsTemplate(),v.qy`<page-loader></page-loader>`)}`:v.qy`<error-plug></error-plug>`}async poolDetailsTemplate(){return Promise.resolve(this.poolItem).then(e=>e?v.qy`
                        <div class='topInfo'>
                            <p>
                                Manager:
                                <span>
                                    ${e.ManagerName?e.ManagerName:"Not assigned"}
                                </span>
                            </p>
                            <p>
                                Division:
                                <span>
                                    ${e.DivisionName}
                                </span>
                            </p>
                        </div>

                        <div class='editButton'>
                            <iceberg-button
                                .size=${E.bf.XS}
                                @click=${this.editPoolButtonClickHandler}
                            >
                                Edit
                            </iceberg-button>
                        </div>

                        <div class='section'>
                            <h2>Users list</h2>
                            <div>
                                <users-assigned-into-pool-table
                                    .displayedEntities=${e.Users??[]}
                                ></users-assigned-into-pool-table> 
                            </div>
                            <iceberg-button
                                .size=${E.bf.XS}
                                @click=${this.assignUsersButtonClickHandler}
                            >
                                Assign users
                            </iceberg-button>
                        </div>
                    `:v.qy`<error-plug></error-plug>`)}assignUsersButtonClickHandler(){const e={mode:s.ks.assignIntoPool},t=new CustomEvent(this.ASSIGN_USERS_BUTTON_CLICK_EVENT_NAME,{detail:e,bubbles:!0,composed:!0});this.dispatchEvent(t)}editPoolButtonClickHandler(){Promise.resolve(this.poolItem).then(e=>{if(e){const t={mode:d.yy.UPDATE,poolItem:e},o=new CustomEvent(this.EDIT_POOL_BUTTON_CLICK_EVENT_NAME,{detail:t,bubbles:!0,composed:!0});this.dispatchEvent(o)}})}}T.styles=v.AH`
        ${b}
    `,function(e,t,o,s){var n,i=arguments.length,r=i<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,o):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(e,t,o,s);else for(var l=e.length-1;l>=0;l--)(n=e[l])&&(r=(i<3?n(r):i>3?n(t,o,r):n(t,o))||r);i>3&&r&&Object.defineProperty(t,o,r)}([(0,l.MZ)({type:Object,reflect:!1,attribute:!1})],T.prototype,"poolItem",void 0)},7765(e,t,o){o.d(t,{k:()=>d});var s=o(3757),n=o(7843),i=o(6161);const r=i.AH`div{display:flex;align-items:center;flex-direction:column;justify-content:center;width:100%;height:100%;padding:20px}`;var l=o(2745),c=o(6388);(0,o(581).Rx)();class a extends i.WF{constructor(){super(...arguments),this.errorMessage=c.Rb,this.ADDITIONAL_MESSAGE="Try to reload this page"}render(){return i.qy`
            <div>
                <p>${this.errorMessage}</p>
                <p>${this.ADDITIONAL_MESSAGE}</p>
                <iceberg-button
                    @click=${()=>window.location.reload()}
                >
                    Reload page
                </iceberg-button>
            </div>
        `}}function d(){(0,s.X)(n.I.errorPlug,a)}a.styles=i.AH`
        ${r}
    `,function(e,t,o,s){var n,i=arguments.length,r=i<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,o):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(e,t,o,s);else for(var l=e.length-1;l>=0;l--)(n=e[l])&&(r=(i<3?n(r):i>3?n(t,o,r):n(t,o))||r);i>3&&r&&Object.defineProperty(t,o,r)}([(0,l.MZ)()],a.prototype,"errorMessage",void 0)},7287(e,t,o){o.d(t,{S:()=>a});var s=o(3757),n=o(7843),i=o(6161),r=o(2149);const l=i.AH`div{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;width:100vw;height:100vh;background-color:hsla(0,0%,60%,.5)}span{width:60px;height:60px;border-width:4px}`;class c extends r.H{render(){return i.qy`
            <div>
                <span></span>
            </div>
        `}}function a(){(0,s.X)(n.I.pageLoader,c)}c.styles=[r.H.styles,i.AH`
          ${l}  
        `]},4420(e,t,o){o.d(t,{JW:()=>s.JW}),o(842);var s=o(6752);o(5228),o(1124),o(9896),console.warn("The main 'lit-element' module entrypoint is deprecated. Please update your imports to use the 'lit' package: 'lit' and 'lit/decorators.ts' or import from 'lit-element/lit-element.ts'. See https://lit.dev/msg/deprecated-import-path for more information.")}}]);