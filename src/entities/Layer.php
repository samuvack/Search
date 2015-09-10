<?php
namespace MyApp\Entities;
/**
 * @Entity
 * @Table(name="website_layers")
 */
class Layer implements \JsonSerializable {
	/**
	 * @Id @Column(type="integer")
	 * @GeneratedValue
	 */
	private $id;
	/** @Column(type="text") */
	private $name;
	/** @Column(type="boolean") */
	private $visible;
	/** @Column(type="boolean") */
	private $feature_info;
	/** @Column(type="text") */
	private $name_legend;
	/** @Column(type="text") */
	private $db_table;
	/** @Column(type="text") */
	private $style;
	/** @Column(type="integer") */
	private $order_draw;
	/** @Column(type="integer") */
	private $order_legend;
	/**
	 * @ManyToOne(targetEntity="Group", inversedBy="layer")
	 * @JoinColumn(name="group_id")
	 */
	private $group_id;
	public function getId() {
		return $this->id;
	}

	public function getName() {
		return $this->name;
	}

	public function getLegendName() {
		return $this->name_legend;
	}

	public function isVisible() {
		return $this->visible;
	}

	public function getStyle() {
		return $this->style;
	}

	public function getGroup() {
		return $this->group_id;
	}

	public function getTable() {
		return $this->db_table;
	}
	/**
	 * (PHP 5 &gt;= 5.4.0)<br/>
	 * Specify data which should be serialized to JSON
	 * @link http://php.net/manual/en/jsonserializable.jsonserialize.php
	 * @return mixed data which can be serialized by <b>json_encode</b>,
	 * which is a value of any type other than a resource.
	 */
	function jsonSerialize() {
		return [
			'id'=>$this->id,
			'name'=>$this->name,
			'visible'=>$this->visible
		];
	}
}
