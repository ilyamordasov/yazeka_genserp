import React, { useRef, useEffect } from "react";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import BackButton from "../atoms/BackButton";
import Input from "../atoms/Input";
import HistoryButton from "../atoms/HistoryButton";

const INPUTGROUP_RADIUS = 40;

const img1 = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0_19035_24074)">
        <path d="M17.0257 6.92302L16.482 6.7418L15.9341 5.78306C15.245 4.57706 15.0545 4.28017 14.8272 4.07605C14.5966 3.86887 14.3256 3.71161 14.0313 3.61412C13.7413 3.51807 13.389 3.5 12 3.5C10.611 3.5 10.2587 3.51807 9.96873 3.61412C9.67442 3.71161 9.40342 3.86887 9.17275 4.07605C8.94549 4.28017 8.75502 4.57705 8.06588 5.78305L7.51803 6.7418L6.97434 6.92303C5.14963 7.53126 4.6694 7.72202 4.34264 8.01137C4.06508 8.25714 3.84567 8.56157 3.70027 8.9026C3.5291 9.3041 3.5 9.82 3.5 11.7434V12H2V11.7434C2 9.95844 2 9.06596 2.32044 8.31434C2.55306 7.76869 2.90413 7.2816 3.34822 6.88836C3.95994 6.34669 4.80663 6.06446 6.5 5.5L6.76351 5.03885C7.40144 3.92247 7.72041 3.36427 8.17045 2.96008C8.55489 2.61479 9.00655 2.35268 9.49708 2.1902C10.0713 2 10.7142 2 12 2C13.2858 2 13.9287 2 14.5029 2.1902C14.9934 2.35268 15.4451 2.61479 15.8296 2.96008C16.2796 3.36428 16.5986 3.92247 17.2365 5.03885L17.5 5.5C19.1934 6.06446 20.0401 6.34669 20.6518 6.88836C21.0959 7.2816 21.4469 7.76869 21.6796 8.31434C22 9.06596 22 9.95845 22 11.7434V12H20.5V11.7434C20.5 9.82 20.4709 9.3041 20.2997 8.9026C20.1543 8.56157 19.9349 8.25714 19.6574 8.01137C19.3306 7.72202 18.8504 7.53126 17.0257 6.92302Z" fill="black"/>
        <path d="M2.01048 16H3.51077C3.51981 16.4363 3.53642 16.8033 3.56695 17.1243C3.63019 17.7894 3.74238 18.1006 3.8684 18.3062C4.07454 18.6426 4.35737 18.9254 4.69375 19.1316C4.8994 19.2576 5.21054 19.3698 5.87566 19.433C6.5631 19.4984 7.46158 19.5 8.8 19.5H10V21H8.8C6.18126 21 4.87188 21 3.91001 20.4105C3.37178 20.0807 2.91926 19.6282 2.58944 19.09C2.15384 18.3791 2.04015 17.4785 2.01048 16Z" fill="black"/>
        <path d="M14 21V19.5H15.2C16.5384 19.5 17.4369 19.4984 18.1243 19.433C18.7895 19.3698 19.1006 19.2576 19.3062 19.1316C19.6426 18.9254 19.9255 18.6426 20.1316 18.3062C20.2576 18.1006 20.3698 17.7894 20.4331 17.1243C20.4636 16.8033 20.4802 16.4363 20.4892 16H21.9895C21.9598 17.4785 21.8462 18.3791 21.4106 19.09C21.0807 19.6282 20.6282 20.0807 20.09 20.4105C19.1281 21 17.8187 21 15.2 21H14Z" fill="black"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M17.4294 12.5C17.4294 15.4986 14.9986 17.9294 12 17.9294C9.0014 17.9294 6.57056 15.4986 6.57056 12.5C6.57056 9.50137 9.0014 7.07053 12 7.07053C14.9986 7.07053 17.4294 9.50137 17.4294 12.5ZM15.9294 12.5C15.9294 14.6701 14.1702 16.4294 12 16.4294C9.82983 16.4294 8.07056 14.6701 8.07056 12.5C8.07056 10.3298 9.82983 8.57053 12 8.57053C14.1702 8.57053 15.9294 10.3298 15.9294 12.5Z" fill="black"/>
        </g>
        <defs>
        <clipPath id="clip0_19035_24074">
        <rect width="24" height="24" fill="white"/>
        </clipPath>
        </defs>
    </svg>
)
const img2 = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0_19035_24081)">
        <path fillRule="evenodd" clipRule="evenodd" d="M8.06569 2.08655L6.93432 3.21792L15.7373 12.0209L6.93432 20.8238L8.06569 21.9552L18 12.0209L8.06569 2.08655Z" fill="white"/>
        </g>
        <defs>
        <clipPath id="clip0_19035_24081">
        <rect width="24" height="24" fill="white"/>
        </clipPath>
        </defs>
    </svg>
)

const FigmaInputGroup = ({ value, onChange, onSend }) => {
  const textareaRef = useRef(null);
  useEffect(() => {
    if (textareaRef.current) textareaRef.current.focus();
  }, []);
  const canSend = value && value.trim().length > 0;
  return (
    <Container
      fluid
      style={{
        background: 'rgba(0,0,0,0.05)',
        borderRadius: 28,
        paddingRight: 8,
        paddingLeft: 16,
        paddingTop: 16,
        paddingBottom: 8,
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        gap: 8,
        position: 'relative',
      }}
      className="p-8 m-0"
      onClick={() => {
        if (textareaRef.current) textareaRef.current.focus();
      }}
    >
      <div style={{ width: '100%' }}>
        <Row style={{ width: '100%', minHeight: 44 }}>
          <textarea
            ref={textareaRef}
            placeholder="Аsk Yazeka anything"
            rows={3}
            value={value}
            onChange={onChange}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            style={{
              width: '100%',
              minHeight: 44,
              resize: 'none',
              border: 'none',
              background: 'transparent',
              boxShadow: 'none',
              fontSize: 16,
              fontFamily: 'YS Text Web, sans-serif',
              color: '#000',
              lineHeight: '22px',
              fontWeight: 400,
              outline: 'none',
              zIndex: 1,
              overflow: 'hidden',
            }}
            onInput={e => {
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
          />
        </Row>
        <Row className="g-0" style={{ justifyContent: 'flex-end', alignItems: 'flex-end', width: '100%', marginTop: 0, paddingRight: 5 }}>
          <Col xs="auto" style={{ paddingRight: 4 }}>
            <div
              style={{
                background: 'rgba(0,0,0,0.05)',
                borderRadius: 100,
                width: 48,
                height: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxSizing: 'border-box',
                padding: 0
              }}
            >
              {img1}
            </div>
          </Col>
          <Col xs="auto">
            <div
              style={{
                background: '#F8604A',
                borderRadius: 100,
                width: 48,
                height: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxSizing: 'border-box',
                padding: 0,
                cursor: canSend ? 'pointer' : 'not-allowed',
                opacity: canSend ? 1 : 0.5,
              }}
              onClick={canSend ? onSend : undefined}
            >
              {img2}
            </div>
          </Col>
        </Row>
      </div>
    </Container>
  );
};

const InputGroup = ({ figmaActive, onInputFocus, value, onChange, onSend, ...props }) => {
  if (figmaActive) return <FigmaInputGroup value={value} onChange={onChange} onSend={onSend} />;
  return (
    <div
      style={{
        width: '100%',
        borderRadius: INPUTGROUP_RADIUS,
        position: 'relative',
        ...props.style,
      }}
    >
      <Container
        className="p-0 m-0 d-flex align-items-center"
        fluid
        style={{ position: 'relative', zIndex: 1, background: '#fff', borderRadius: INPUTGROUP_RADIUS }}
      >
        <Row className="g-2 align-items-center flex-nowrap" style={{ width: '100%' }}>
          <Col xs="auto" className="d-flex align-items-center">
            <BackButton />
          </Col>
          <Col className="d-flex align-items-center" style={{ flex: 1, minWidth: 0 }}>
            <Input onInputFocus={onInputFocus} value={value} onChange={onChange} onSend={onSend} />
          </Col>
          <Col xs="auto" className="d-flex align-items-center">
            <HistoryButton />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default InputGroup; 