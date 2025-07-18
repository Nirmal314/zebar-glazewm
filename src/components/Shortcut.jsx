const Shortcut = ({ commandRunner, commands, iconClass, name }) => {
  const style = {
    cursor: "pointer",
    fontSize: "14px",
    marginLeft: "5px",
  };

  const onClick = () => {
    for (const command of commands) {
      commandRunner(command);
    }
  };

  return (
    <button className="box" style={style} onClick={() => onClick()}>
      <i className={`nf ${iconClass}`}></i>
      <span>{name}</span>
    </button>
  );
};

export default Shortcut;
