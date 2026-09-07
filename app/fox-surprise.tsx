'use client';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';

export default function FoxSurprise({open,onClose}:{open:boolean;onClose:()=>void}) {
  return <Dialog open={open} onOpenChange={value=>{if(!value)onClose();}}>
    <DialogContent className="fox-surprise" showCloseButton={false}>
      <DialogClose className="fox-close" aria-label="Закрыть сюрприз">×</DialogClose>
      <DialogTitle className="fox-title">Сердечко для тебя ♡</DialogTitle>
      <DialogDescription className="fox-description">Пашенька, лисичка принесла тебе немного моей любви.</DialogDescription>
      <div className="fox-scene">
        <span className="fox-spark fox-spark-one" aria-hidden="true">♡</span><span className="fox-spark fox-spark-two" aria-hidden="true">♥</span>
        <svg className="gift-fox" viewBox="0 0 360 360" role="img" aria-label="Мультяшная рыжая лисичка протягивает розовое сердечко">
          <ellipse cx="180" cy="329" rx="109" ry="12" fill="#d78b9e" opacity=".16"/>
          <g className="fox-tail"><path d="M220 305C317 330 348 238 310 194C313 253 245 232 222 269Z" fill="#e88b42"/><path d="M310 194C314 227 291 239 276 245C302 250 313 263 316 278C331 250 330 216 310 194" fill="#fff5e6"/></g>
          <ellipse cx="180" cy="264" rx="67" ry="64" fill="#e78c45"/><ellipse cx="180" cy="266" rx="43" ry="51" fill="#fff4e5"/>
          <ellipse cx="141" cy="319" rx="28" ry="12" fill="#784830"/><ellipse cx="219" cy="319" rx="28" ry="12" fill="#784830"/>
          <g className="fox-head">
            <path d="M92 128L80 37Q130 44 153 91M207 91Q233 44 280 37L268 128" fill="#e88b42" stroke="#b96330" strokeWidth="3" strokeLinejoin="round"/>
            <path d="M99 97L95 57L131 91M229 91L265 57L261 99" fill="#f6b2a0"/>
            <path d="M180 78C126 76 85 110 76 161Q96 216 180 235Q264 216 284 161C275 110 234 76 180 78" fill="#ee984e"/>
            <path d="M78 161Q126 144 180 204Q234 144 282 161Q262 219 180 235Q98 219 78 161" fill="#fff6e8"/>
            <path d="M113 149Q127 134 141 149M219 149Q233 134 247 149" fill="none" stroke="#633c31" strokeWidth="6" strokeLinecap="round"/>
            <ellipse cx="113" cy="172" rx="16" ry="9" fill="#ef9b96" opacity=".65"/><ellipse cx="247" cy="172" rx="16" ry="9" fill="#ef9b96" opacity=".65"/>
            <path d="M168 189Q180 182 192 189Q190 200 180 203Q170 200 168 189" fill="#633c31"/><path d="M180 202V210M166 211Q180 222 194 211" fill="none" stroke="#633c31" strokeWidth="3" strokeLinecap="round"/>
          </g>
          <g className="fox-gift">
            <path d="M180 293C158 277 125 255 130 234C134 215 164 211 180 233C196 211 226 215 230 234C235 255 202 277 180 293" fill="#cc3862"/>
            <path d="M144 235Q150 225 161 232" fill="none" stroke="#ffb6cd" strokeWidth="5" strokeLinecap="round"/>
            <ellipse cx="130" cy="267" rx="22" ry="14" transform="rotate(25 130 267)" fill="#ee984e"/><ellipse cx="230" cy="267" rx="22" ry="14" transform="rotate(-25 230 267)" fill="#ee984e"/>
          </g>
        </svg>
      </div>
      <DialogClose className="kiss-button fox-accept">Забрать сердечко ♡</DialogClose>
    </DialogContent>
  </Dialog>;
}
