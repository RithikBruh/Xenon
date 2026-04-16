import { useEffect, useRef, useState } from "react";

export default function InputBox({message, setMessage, sendMessage}) {




    const [cursorPosition, setCursorPosition] = useState({ top: 0, left: 0 });
    const [isFocused, setIsFocused] = useState(false);
    const inputElementRef = useRef(null);


    useEffect(() => {
        inputElementRef.current?.focus();
    }, []);


    const resizeInput = () => {
        const element = inputElementRef.current;
        if (!element) {
            return;
        }

        element.style.height = "auto";
        element.style.height = `${element.scrollHeight}px`;
    };

    const updateCursorPosition = (target) => {
        const cursorStart = target.selectionStart ?? 0;
        const mirror = document.createElement("div");
        const mirrorStyle = mirror.style;
        const computedStyle = window.getComputedStyle(target);

        mirrorStyle.position = "absolute";
        mirrorStyle.visibility = "hidden";
        mirrorStyle.pointerEvents = "none";
        mirrorStyle.whiteSpace = "pre-wrap";
        mirrorStyle.wordBreak = "break-word";
        mirrorStyle.overflowWrap = "break-word";
        mirrorStyle.boxSizing = computedStyle.boxSizing;
        mirrorStyle.width = `${target.clientWidth}px`;
        mirrorStyle.font = computedStyle.font;
        mirrorStyle.letterSpacing = computedStyle.letterSpacing;
        mirrorStyle.lineHeight = computedStyle.lineHeight;
        mirrorStyle.padding = computedStyle.padding;
        mirrorStyle.border = computedStyle.border;

        mirror.textContent = target.value.slice(0, cursorStart);

        const caretMarker = document.createElement("span");
        caretMarker.textContent = target.value.slice(cursorStart, cursorStart + 1) || " ";
        mirror.appendChild(caretMarker);

        document.body.appendChild(mirror);

        const top = caretMarker.offsetTop - target.scrollTop;
        const left = caretMarker.offsetLeft - target.scrollLeft;
        setCursorPosition({ top, left });

        document.body.removeChild(mirror);
    };

    useEffect(() => {
        resizeInput();
    }, [message]);

    const handleSubmit = (event) => {
        event.preventDefault(); // a voids reload
        

        setCursorPosition({ top: 0, left: 0 });
        requestAnimationFrame(() => {
            if (!inputElementRef.current) {
                return;
            }

            inputElementRef.current.style.height = "auto";
            inputElementRef.current.focus();
            updateCursorPosition(inputElementRef.current);
        });

        sendMessage();
    };



    return (
        <div className="input-container" onClick={() => inputElementRef.current?.focus()}>
            <h4 className="input-heading">------------------------------------------------------------ [INPUT] -----------------------------------------------------------</h4>

            {/* <div className="terminal-history">
                {history.slice(-2).map((entry, index) => (
                    <div key={`${entry}-${index}`} className="terminal-line">
                        &gt; {entry}
                    </div>
                ))}
            </div> */}

            <form onSubmit={handleSubmit} className="terminal-form">
                <div className="terminal-prompt">&gt;</div>
                <div
                    className="terminal-input-wrapper"
                    style={{
                        "--cursor-top": `${cursorPosition.top}px`,
                        "--cursor-left": `${cursorPosition.left}px`,
                    }}
                >
                    {isFocused && <span className="terminal-block-cursor" />}
                    <textarea
                        ref={inputElementRef}
                        className="terminal-input"
                        value={message}
                        onChange={(event) => {
                            setMessage(event.target.value);
                            updateCursorPosition(event.target);
                        }}
                        onClick={(event) => updateCursorPosition(event.target)}
                        onKeyUp={(event) => updateCursorPosition(event.target)}
                        onSelect={(event) => updateCursorPosition(event.target)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter" && !event.shiftKey) {
                                event.preventDefault();
                                handleSubmit(event);
                                return;
                            }

                            requestAnimationFrame(() => {
                                if (inputElementRef.current) {
                                    updateCursorPosition(inputElementRef.current);
                                }
                            });
                        }}
                        onFocus={(event) => {
                            setIsFocused(true);
                            updateCursorPosition(event.target);
                        }}
                        onBlur={() => setIsFocused(false)}
                        rows={1}
                        spellCheck={false}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        placeholder="chat.."
                    />
                </div>
            </form>
            <div className="button-container">
                <button onClick={handleSubmit}>Send</button>
                <button onClick={handleSubmit}>Send</button>
                <button onClick={handleSubmit}>Send</button>

            </div>
        </div>
    );
}