function TextInput({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  icon: Icon,
  rightSlot
}) {
  return (
    <div className="form-group">
      <label htmlFor={id} className="form-label">
        {label}
      </label>
      <div className="input-wrap">
        {Icon ? <Icon size={18} className="input-icon" aria-hidden="true" /> : null}
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`text-input ${Icon ? 'with-icon' : ''} ${rightSlot ? 'with-right' : ''}`}
        />
        {rightSlot ? <div className="input-right">{rightSlot}</div> : null}
      </div>
    </div>
  )
}

export default TextInput
