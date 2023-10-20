const Filter = ({ filter, handleFilter }) => {
  return (
    <>
      <label>Filter shown with: </label>
      <input value={filter} onChange={handleFilter} />
    </>
  );
};

export default Filter;
