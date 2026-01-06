import React, { useEffect, useState } from "react";
import api from "../../api";
import { useNavigate } from "react-router-dom";

export default function BrandList() {
  const [brands, setBrands] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    const res = await api.post("/brands/list", {
      page: 1,
      size: 50,
    });
    setBrands(res.data.data);
  };

  return (
    <div>
      <h2>Brands</h2>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Logo</th>
            <th>Name</th>
            <th>Website</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {brands.map((brand) => (
            <tr key={brand._id}>
              <td>
                {brand.logo && (
                  <img src={brand.logo} alt="" width="50" />
                )}
              </td>
              <td>{brand.name}</td>
              <td>{brand.website}</td>
              <td>
                <button
                  onClick={() =>
                    navigate(`/brands/edit/${brand.slug}`)
                  }
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
